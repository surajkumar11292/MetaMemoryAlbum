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
    const favoritesOnly = searchParams.get('favorites') === 'true';
    const searchQuery = searchParams.get('q') || undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;

    const photos = await db.getPhotos(user.id, {
      is_favorite: favoritesOnly ? true : undefined,
      search: searchQuery,
      year,
      month,
    });

    return NextResponse.json({ photos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search photos' }, { status: 500 });
  }
}
