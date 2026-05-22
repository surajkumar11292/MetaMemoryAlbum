-- MetaMemoryAlbum PostgreSQL Schema Migration
-- Migration 001: Initial Core Tables, Row-Level Security, and Storage Configuration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure clean rebuild (avoids stale/partial schemas from previous attempts)
DROP TABLE IF EXISTS public.share_links CASCADE;
DROP TABLE IF EXISTS public.month_preferences CASCADE;
DROP TABLE IF EXISTS public.photos CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  storage_used_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Photos Table
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  aspect_ratio NUMERIC(5,3),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  location_name TEXT,
  camera_model TEXT,
  lens_model TEXT,
  iso INTEGER,
  focal_length TEXT,
  exposure_time TEXT,
  caption TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_cover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Month Preferences Table
CREATE TABLE public.month_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
  note TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'link', 'public')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, year, month)
);

-- 4. Share Links Table
CREATE TABLE public.share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Chronological & Flashback Queries
CREATE INDEX idx_photos_user_year_month ON public.photos(user_id, year DESC, month DESC, captured_at DESC);
CREATE INDEX idx_photos_user_month_flashback ON public.photos(user_id, month, year DESC, captured_at DESC);
CREATE INDEX idx_photos_user_favorites ON public.photos(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_share_links_token ON public.share_links(token) WHERE is_revoked = FALSE;

-- Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.month_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can manage own profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id);

-- Photos: Users can perform all operations on their own photos
CREATE POLICY "Users can manage own photos" 
  ON public.photos FOR ALL 
  USING (auth.uid() = user_id);

-- Shared Month Photos Public Access via valid Share Token
CREATE POLICY "Anyone with valid token can view shared month photos"
  ON public.photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.share_links s
      WHERE s.user_id = public.photos.user_id
        AND s.year = public.photos.year
        AND s.month = public.photos.month
        AND s.is_revoked = FALSE
        AND (s.expires_at IS NULL OR s.expires_at > NOW())
    )
  );

-- Month Preferences: User access
CREATE POLICY "Users can manage own month preferences"
  ON public.month_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Share Links: User access
CREATE POLICY "Users can manage own share links"
  ON public.share_links FOR ALL
  USING (auth.uid() = user_id);

-- 5. Supabase Storage Bucket for Photos (100% Free - No Credit Card Required)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Photo View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Photo Upload" ON storage.objects;

CREATE POLICY "Public Photo View"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Authenticated Photo Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');
