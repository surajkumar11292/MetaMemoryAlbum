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

    // Register with Supabase
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
      const isAlreadyRegistered = error.message.toLowerCase().includes('already registered');
      return NextResponse.json(
        { error: error.message, isAlreadyRegistered },
        { status: isAlreadyRegistered ? 409 : 400 }
      );
    }

    // Determine user ID
    const userId = data.user?.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create user in local database
    const newUser = await db.createUser({
      id: userId,
      email: trimmedEmail,
      name: trimmedName,
      avatar_url: avatar_url || undefined,
      storage_used_bytes: 0,
    });

    // Generate JWT
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
      requiresEmailConfirmation: !data.session && !!data.user?.identities?.length,
    });

    // Set JWT cookie
    response.cookies.set('meta_jwt', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Set session cookie
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
