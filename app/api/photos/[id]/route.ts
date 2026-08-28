import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { SEED_USER } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    const userId = user ? user.id : SEED_USER.id;

    const photo = await db.getPhotoById(userId, params.id);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    return NextResponse.json({ photo });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve photo' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    const userId = user ? user.id : SEED_USER.id;

    const body = await req.json();
    const updates: any = {};

    if (typeof body.is_favorite === 'boolean') {
      updates.is_favorite = body.is_favorite;
    }
    if (typeof body.caption === 'string') {
      updates.caption = body.caption;
    }
    if (typeof body.is_cover === 'boolean') {
      updates.is_cover = body.is_cover;
    }

    const updated = await db.updatePhoto(userId, params.id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Photo not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, photo: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    const userId = user ? user.id : SEED_USER.id;

    const success = await db.deletePhoto(userId, params.id);
    if (!success) {
      return NextResponse.json({ error: 'Photo not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
