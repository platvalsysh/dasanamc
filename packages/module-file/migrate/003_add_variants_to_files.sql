-- Add variants field to modules.files table
-- This field stores metadata for image variants (thumbnails)

ALTER TABLE modules.files
  ADD COLUMN IF NOT EXISTS variants JSONB;
