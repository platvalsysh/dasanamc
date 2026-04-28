-- Create storage buckets for file uploads
-- This migration creates the necessary storage buckets for the file management system

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  -- Public images bucket (10MB limit)
  ('public-images', 'public-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]),
  -- Public videos bucket (100MB limit)
  ('public-videos', 'public-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/ogg']::text[]),
  -- Private files bucket (50MB limit, all types allowed)
  ('files', 'files', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for public-images bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public images are publicly accessible' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'public-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload images' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'public-images' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own uploads' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can update their own uploads"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'public-images' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own uploads' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can delete their own uploads"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'public-images' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- RLS Policies for public-videos bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public videos are publicly accessible' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public videos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'public-videos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload videos' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can upload videos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'public-videos' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own video uploads' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can update their own video uploads"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'public-videos' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own video uploads' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can delete their own video uploads"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'public-videos' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- RLS Policies for private files bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view their own files' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can view their own files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'files' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload files' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own file uploads' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can update their own file uploads"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'files' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own file uploads' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can delete their own file uploads"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'files' AND auth.role() = 'authenticated');
  END IF;
END $$;
