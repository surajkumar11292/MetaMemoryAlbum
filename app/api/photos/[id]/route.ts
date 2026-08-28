import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photo = await db.getPhotoById(user.id, params.id);
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const updated = await db.updatePhoto(user.id, params.id, updates);
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await db.deletePhoto(user.id, params.id);
    if (!success) {
      return NextResponse.json({ error: 'Photo not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
