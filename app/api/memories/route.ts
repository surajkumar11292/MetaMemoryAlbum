import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { SEED_USER } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    const userId = user ? user.id : SEED_USER.id;

    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('year');
    const selectedYear = yearParam && yearParam !== 'all' ? parseInt(yearParam, 10) : undefined;

    const stream = await db.getChronologicalStream(userId, selectedYear);
    const availableYears = await db.getAvailableYears(userId);

    return NextResponse.json({
      years: stream,
      availableYears,
      user,
    });
  } catch (error) {
    console.error('Failed to fetch memories:', error);
    return NextResponse.json({ error: 'Failed to retrieve memories' }, { status: 500 });
  }
}
