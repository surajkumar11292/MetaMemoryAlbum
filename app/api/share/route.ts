import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { year, month } = body;

    if (!year || !month) {
      return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
    }

    const link = await db.createOrGetShareLink(user.id, parseInt(year, 10), parseInt(month, 10));
    return NextResponse.json({ success: true, link });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const success = await db.revokeShareLink(user.id, token);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revoke share link' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token parameter is required' }, { status: 400 });
    }

    const shared = await db.getSharedMonthByToken(token);
    if (!shared) {
      return NextResponse.json({ error: 'Shared album not found or has been revoked' }, { status: 404 });
    }

    return NextResponse.json(shared);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve shared memory' }, { status: 500 });
  }
}
