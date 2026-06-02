import exifr from 'exifr';

export interface ExtractedMetadata {
  captured_at: string;
  year: number;
  month: number;
  day: number;
  width?: number;
  height?: number;
  aspect_ratio?: number;
  latitude?: number;
  longitude?: number;
  camera_model?: string;
  lens_model?: string;
  iso?: number;
  focal_length?: string;
  exposure_time?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || 'Unknown';
}

/**
 * Extracts EXIF metadata from an ArrayBuffer, Buffer, or File with fallback hierarchy:
 * 1. EXIF DateTimeOriginal / CreateDate
 * 2. Embedded Tag timestamp
 * 3. File lastModified
 * 4. Current timestamp fallback
 */
export async function extractPhotoMetadata(
  input: Buffer | ArrayBuffer | Uint8Array,
  fallbackLastModified?: number
): Promise<ExtractedMetadata> {
  let capturedDate: Date | null = null;
  let width: number | undefined;
  let height: number | undefined;
  let latitude: number | undefined;
  let longitude: number | undefined;
  let camera_model: string | undefined;
  let lens_model: string | undefined;
  let iso: number | undefined;
  let focal_length: string | undefined;
  let exposure_time: string | undefined;

  try {
    const rawExif = await exifr.parse(input, {
      tiff: true,
      xmp: true,
      icc: false,
      iptc: false,
      jfif: true,
      gps: true,
      translateKeys: true,
      reviveValues: true,
    });

    if (rawExif) {
      // 1. Primary: DateTimeOriginal -> CreateDate -> ModifyDate
      const rawDate = rawExif.DateTimeOriginal || rawExif.CreateDate || rawExif.ModifyDate || rawExif.DateCreated;
      if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
        capturedDate = rawDate;
      } else if (typeof rawDate === 'string') {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          capturedDate = parsed;
        }
      }

      // Dimensions
      width = rawExif.ImageWidth || rawExif.ExifImageWidth;
      height = rawExif.ImageHeight || rawExif.ExifImageHeight;

      // GPS
      if (rawExif.latitude !== undefined && rawExif.longitude !== undefined) {
        latitude = Number(rawExif.latitude);
        longitude = Number(rawExif.longitude);
      }

      // Camera
      const make = rawExif.Make ? String(rawExif.Make).trim() : '';
      const model = rawExif.Model ? String(rawExif.Model).trim() : '';
      if (model) {
        camera_model = make && !model.toLowerCase().includes(make.toLowerCase()) ? `${make} ${model}` : model;
      }
      if (rawExif.LensModel) {
        lens_model = String(rawExif.LensModel).trim();
      }
      if (rawExif.ISO) {
        iso = Number(rawExif.ISO);
      }
      if (rawExif.FocalLength) {
        focal_length = `${rawExif.FocalLength}mm`;
      }
      if (rawExif.ExposureTime) {
        exposure_time = typeof rawExif.ExposureTime === 'number' 
          ? rawExif.ExposureTime < 1 
            ? `1/${Math.round(1 / rawExif.ExposureTime)}s` 
            : `${rawExif.ExposureTime}s`
          : String(rawExif.ExposureTime);
      }
    }
  } catch (err) {
    console.warn('[EXIF] Could not parse EXIF data, falling back to file timestamp', err);
  }

  // Fallback 1: File lastModified
  if (!capturedDate && fallbackLastModified) {
    const d = new Date(fallbackLastModified);
    if (!isNaN(d.getTime())) {
      capturedDate = d;
    }
  }

  // Fallback 2: Current ingestion time
  if (!capturedDate) {
    capturedDate = new Date();
  }

  const year = capturedDate.getFullYear();
  const month = capturedDate.getMonth() + 1; // 1-12
  const day = capturedDate.getDate(); // 1-31

  let aspect_ratio: number | undefined;
  if (width && height && height > 0) {
    aspect_ratio = Number((width / height).toFixed(3));
  }

  return {
    captured_at: capturedDate.toISOString(),
    year,
    month,
    day,
    width,
    height,
    aspect_ratio,
    latitude,
    longitude,
    camera_model,
    lens_model,
    iso,
    focal_length,
    exposure_time,
  };
}
