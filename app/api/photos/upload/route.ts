import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { extractPhotoMetadata } from '@/lib/exif';
import { Photo } from '@/lib/types';
import path from 'path';

export const dynamic = 'force-dynamic';

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/avif',
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedPhotos: Photo[] = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type) && !file.name.match(/\.(jpe?g|png|webp|heic|avif)$/i)) {
        continue; // Skip invalid types
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds 25MB limit` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const metadata = await extractPhotoMetadata(buffer, file.lastModified);

      // Create a clean, safe filename
      const sanitizedName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_');
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const storageKey = `memories/${metadata.year}/${String(metadata.month).padStart(2, '0')}/${photoId}_${sanitizedName}`;

      // Convert image to optimized base64 Data URI for instant local zero-config preview and persistence
      const base64Data = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

      const newPhoto: Photo = {
        id: photoId,
        user_id: user.id,
        storage_key: storageKey,
        url: base64Data,
        thumbnail_url: base64Data,
        captured_at: metadata.captured_at,
        uploaded_at: new Date().toISOString(),
        year: metadata.year,
        month: metadata.month,
        day: metadata.day,
        filename: sanitizedName,
        mime_type: file.type || 'image/jpeg',
        file_size: file.size,
        width: metadata.width,
        height: metadata.height,
        aspect_ratio: metadata.width && metadata.height ? parseFloat((metadata.width / metadata.height).toFixed(3)) : 1.5,
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        location_name: metadata.latitude && metadata.longitude ? `GPS: ${metadata.latitude.toFixed(2)}, ${metadata.longitude.toFixed(2)}` : undefined,
        camera_model: metadata.camera_model,
        lens_model: metadata.lens_model,
        iso: metadata.iso,
        focal_length: metadata.focal_length,
        exposure_time: metadata.exposure_time,
        caption: undefined,
        is_favorite: false,
        is_cover: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const saved = await db.addPhoto(newPhoto);
      uploadedPhotos.push(saved);
    }

    return NextResponse.json({
      success: true,
      photos: uploadedPhotos,
      count: uploadedPhotos.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload and parse photo metadata' }, { status: 500 });
  }
}
