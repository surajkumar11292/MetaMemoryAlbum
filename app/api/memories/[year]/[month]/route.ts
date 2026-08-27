import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SEED_USER } from '@/lib/db/seed';

export async function GET(
  req: Request,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const year = parseInt(params.year, 10);
    const month = parseInt(params.month, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 });
    }

    const monthDetails = await db.getMonthDetails(SEED_USER.id, year, month);
    if (!monthDetails) {
      return NextResponse.json({ error: 'Month not found' }, { status: 404 });
    }

    return NextResponse.json({ month: monthDetails });
  } catch (error) {
    console.error('Failed to get month details:', error);
    return NextResponse.json({ error: 'Failed to retrieve month details' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const year = parseInt(params.year, 10);
    const month = parseInt(params.month, 10);
    const body = await req.json();

    if (body.cover_photo_id) {
      const success = await db.setMonthCover(SEED_USER.id, year, month, body.cover_photo_id);
      if (!success) {
        return NextResponse.json({ error: 'Failed to set cover photo' }, { status: 400 });
      }
    }

    const updated = await db.getMonthDetails(SEED_USER.id, year, month);
    return NextResponse.json({ success: true, month: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update month preferences' }, { status: 500 });
  }
}
