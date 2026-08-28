import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { signJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data?.user) {
      return NextResponse.json(
        { error: error?.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const sbUser = data.user;
    const name =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      sbUser.email?.split('@')[0] ||
      'Archivist';
    const avatarUrl =
      sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || undefined;

    // Ensure user exists in database
    let dbUser = await db.getUser(sbUser.id);
    if (!dbUser) {
      dbUser = await db.createUser({
        id: sbUser.id,
        email: sbUser.email || email,
        name,
        avatar_url: avatarUrl,
        storage_used_bytes: 0,
      });
    }

    // Generate JWT token
    const token = await signJWT({
      sub: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar_url: dbUser.avatar_url,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar_url: dbUser.avatar_url,
        storage_used_bytes: dbUser.storage_used_bytes,
      },
      token,
    });

    // Set HTTP-Only JWT cookie
    response.cookies.set('meta_jwt', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Also set legacy meta_session_user for fallback
    const sessionData = JSON.stringify({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar_url: dbUser.avatar_url,
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
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during login' }, { status: 500 });
  }
}
