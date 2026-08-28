import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get('month');
    const month = monthParam ? parseInt(monthParam, 10) : new Date().getMonth() + 1;

    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month number (1-12)' }, { status: 400 });
    }

    const flashback = await db.getFlashback(user.id, month);

    return NextResponse.json({ flashback, user });
  } catch (error) {
    console.error('Failed to get flashback:', error);
    return NextResponse.json({ error: 'Failed to retrieve flashback data' }, { status: 500 });
  }
}
