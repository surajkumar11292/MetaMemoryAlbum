import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { SEED_USER } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
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
    const { userId, email, name, avatar_url } = body;

    let user;
    if (userId === SEED_USER.id || (!userId && !email)) {
      // Demo guest access
      user = SEED_USER;
    } else {
      const targetId = userId || `user_${Math.random().toString(36).substring(2, 10)}`;
      user = await db.getUser(targetId);
      if (!user) {
        user = await db.createUser({
          id: targetId,
          email: email || 'archivist@metamemory.app',
          name: name || (email ? email.split('@')[0] : 'Archivist'),
          avatar_url: avatar_url || null,
          storage_used_bytes: 0,
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      user,
    });

    const cookieData = JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
    });

    response.cookies.set('meta_session_user', cookieData, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatar_url } = body;

    const updated = await db.updateUser(user.id, {
      name: name !== undefined ? name : user.name,
      avatar_url: avatar_url !== undefined ? avatar_url : user.avatar_url,
    });

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, user: updated });

    const cookieData = JSON.stringify({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatar_url: updated.avatar_url,
    });

    response.cookies.set('meta_session_user', cookieData, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('meta_session_user');
  return response;
}
