export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  storage_used_bytes: number;
}

export interface Photo {
  id: string;
  user_id: string;
  storage_key: string;
  url: string;
  thumbnail_url: string;
  captured_at: string; // ISO 8601 string derived from EXIF
  uploaded_at: string;
  year: number; // e.g. 2026
  month: number; // 1 - 12
  day: number; // 1 - 31
  filename: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  aspect_ratio?: number; // width / height
  latitude?: number;
  longitude?: number;
  location_name?: string;
  camera_model?: string;
  lens_model?: string;
  iso?: number;
  focal_length?: string;
  exposure_time?: string;
  caption?: string;
  is_favorite: boolean;
  is_cover: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthSummary {
  year: number;
  month: number;
  month_name: string;
  photo_count: number;
  days_captured: number;
  cover_photo?: Photo;
  photos: Photo[];
  is_shared?: boolean;
  share_token?: string;
}

export interface YearSummary {
  year: number;
  total_memories: number;
  months: MonthSummary[];
}

export interface ShareLink {
  id: string;
  user_id: string;
  year: number;
  month: number;
  token: string;
  is_revoked: boolean;
  expires_at?: string;
  created_at: string;
  access_count: number;
}

export interface MonthPreference {
  id: string;
  user_id: string;
  year: number;
  month: number;
  cover_photo_id?: string;
  note?: string;
  visibility: 'private' | 'link' | 'public';
}

export interface FlashbackYearGroup {
  year: number;
  photos: Photo[];
  photo_count: number;
  days_captured: number;
  cover_photo?: Photo;
}

export interface FlashbackSummary {
  month: number;
  month_name: string;
  years: FlashbackYearGroup[];
  total_photos: number;
  span_years: number[];
}
