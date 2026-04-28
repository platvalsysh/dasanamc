-- Add thumbnail field to modules.documents table
-- This field references a file from modules.files to use as document thumbnail

ALTER TABLE modules.documents
  ADD COLUMN thumbnail UUID;

-- Add foreign key constraint with CASCADE on update and SET NULL on delete
ALTER TABLE modules.documents
  ADD CONSTRAINT documents_thumbnail_fkey
  FOREIGN KEY (thumbnail)
  REFERENCES modules.files(id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

-- Add index for efficient thumbnail queries
CREATE INDEX IF NOT EXISTS documents_thumbnail_idx 
  ON modules.documents USING btree (thumbnail);
