import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { signJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, name, avatar_url } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and your full name are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    let userId: string | null = null;
    let requiresEmailConfirmation = false;

    // 1. Attempt registration with Supabase Auth
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
            avatar_url: avatar_url || undefined,
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists')) {
          return NextResponse.json(
            { error: 'This email is already registered. Please sign in with your password.', isAlreadyRegistered: true },
            { status: 409 }
          );
        }
        // If Supabase has an internal database error with custom triggers, fallback gracefully
        console.warn('Supabase signup notice:', error.message);
      } else if (data?.user) {
        // If identities is empty array, user exists in Supabase (unconfirmed duplicate)
        if (data.user.identities && data.user.identities.length === 0) {
          return NextResponse.json(
            { error: 'This email is already registered. Please sign in with your password.', isAlreadyRegistered: true },
            { status: 409 }
          );
        }
        userId = data.user.id;
        requiresEmailConfirmation = !data.session && !!data.user.identities?.length;
      }
    } catch (sbErr: any) {
      console.warn('Supabase auth catch:', sbErr?.message);
    }

    // 2. Generate resilient unique ID if not provided by Supabase
    if (!userId) {
      userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    // 3. Create or fetch user in local / global MemoryDatabase
    let newUser;
    try {
      newUser = await db.getUser(userId);
      if (!newUser) {
        newUser = await db.createUser({
          id: userId,
          email: trimmedEmail,
          name: trimmedName,
          avatar_url: avatar_url || undefined,
          storage_used_bytes: 0,
        });
      }
    } catch (dbError: any) {
      console.warn('Local DB user creation fallback:', dbError?.message);
      newUser = {
        id: userId,
        email: trimmedEmail,
        name: trimmedName,
        avatar_url: avatar_url || undefined,
        storage_used_bytes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Save credentials in database
    await db.saveCredentials(trimmedEmail, password, newUser.id);

    // 4. Generate signed JWT token
    const token = await signJWT({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar_url: newUser.avatar_url,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar_url: newUser.avatar_url,
        storage_used_bytes: newUser.storage_used_bytes,
      },
      token,
      requiresEmailConfirmation,
    });

    // 5. Set HTTP-Only JWT cookie
    response.cookies.set('meta_jwt', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });

    // 6. Set legacy session cookie fallback
    const sessionData = JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar_url: newUser.avatar_url,
    });

    response.cookies.set('meta_session_user', sessionData, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Registration critical error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
