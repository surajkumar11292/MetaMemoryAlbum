import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { SEED_USER } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = '__Host-meta-session';

export async function GET() {
  const cookieStore = cookies();
  const sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get('meta_session_user')?.value || SEED_USER.id;

  const user = await db.getUser(sessionUserId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      storage_used_bytes: user.storage_used_bytes,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || SEED_USER.id;
    const user = await db.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set('meta_session_user', user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('meta_session_user');
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
