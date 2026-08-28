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

    const trimmedEmail = email.trim().toLowerCase();
    let authenticatedUser: any = null;

    // 1. Try Supabase Auth first
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (!error && data?.user) {
        const sbUser = data.user;
        const name =
          sbUser.user_metadata?.full_name ||
          sbUser.user_metadata?.name ||
          sbUser.email?.split('@')[0] ||
          'Archivist';
        const avatarUrl =
          sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || undefined;

        let dbUser = await db.getUser(sbUser.id);
        if (!dbUser) {
          dbUser = await db.createUser({
            id: sbUser.id,
            email: sbUser.email || trimmedEmail,
            name,
            avatar_url: avatarUrl,
            storage_used_bytes: 0,
          });
        }
        authenticatedUser = dbUser;
      }
    } catch (sbErr) {
      console.warn('Supabase sign in attempt exception:', sbErr);
    }

    // 2. If Supabase auth was not successful, verify against local database credentials
    if (!authenticatedUser) {
      const credResult = await db.verifyCredentials(trimmedEmail, password);
      if (credResult.valid && credResult.user) {
        authenticatedUser = credResult.user;
      }
    }

    // 3. If neither method authenticated, return 401
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 4. Generate JWT token
    const token = await signJWT({
      sub: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      avatar_url: authenticatedUser.avatar_url,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        avatar_url: authenticatedUser.avatar_url,
        storage_used_bytes: authenticatedUser.storage_used_bytes,
      },
      token,
    });

    // 5. Set HTTP-Only JWT cookie
    response.cookies.set('meta_jwt', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 6. Also set legacy meta_session_user for fallback
    const sessionData = JSON.stringify({
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      avatar_url: authenticatedUser.avatar_url,
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
