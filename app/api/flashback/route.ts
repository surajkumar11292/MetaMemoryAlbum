import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SEED_USER } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get('month');
    const month = monthParam ? parseInt(monthParam, 10) : new Date().getMonth() + 1;

    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month number (1-12)' }, { status: 400 });
    }

    const flashback = await db.getFlashback(SEED_USER.id, month);

    return NextResponse.json({ flashback });
  } catch (error) {
    console.error('Failed to get flashback:', error);
    return NextResponse.json({ error: 'Failed to retrieve flashback data' }, { status: 500 });
  }
}
