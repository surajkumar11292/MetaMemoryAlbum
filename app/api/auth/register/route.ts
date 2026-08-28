import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
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

    // 1. Primary: Use Supabase Admin API to create pre-confirmed user credentials
    try {
      const adminClient = getServiceSupabase();
      const { data: adminUser, error: adminError } = await adminClient.auth.admin.createUser({
        email: trimmedEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: trimmedName,
          avatar_url: avatar_url || undefined,
        },
      });

      if (adminError) {
        const msg = adminError.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists') || msg.includes('email address has already been taken')) {
          return NextResponse.json(
            { error: 'This email is already registered. Please sign in with your password.', isAlreadyRegistered: true },
            { status: 409 }
          );
        }
        console.warn('Supabase admin create user notice:', adminError.message);
      } else if (adminUser?.user) {
        userId = adminUser.user.id;
      }
    } catch (adminEx: any) {
      console.warn('Supabase admin API exception:', adminEx?.message);
    }

    // 2. Secondary: Fallback to standard Supabase signUp if admin method was skipped or errored
    if (!userId) {
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
        } else if (data?.user) {
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
        console.warn('Supabase fallback signUp exception:', sbErr?.message);
      }
    }

    // 3. Fallback: Generate resilient unique ID if Supabase was completely unreachable
    if (!userId) {
      userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    // 4. Create or fetch user in local MemoryDatabase
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

    // Save credentials in local store
    await db.saveCredentials(trimmedEmail, password, newUser.id);

    // 5. Generate signed JWT token
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

    // 6. Set HTTP-Only JWT cookie
    response.cookies.set('meta_jwt', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });

    // 7. Set session cookie fallback
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
