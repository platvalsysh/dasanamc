-- Add is_publish field to modules.files table
-- This field tracks whether files are published (attached to saved documents)
-- or unpublished (from abandoned drafts)

ALTER TABLE modules.files
  ADD COLUMN is_publish BOOLEAN NOT NULL DEFAULT false;

-- Add index for efficient querying of unpublished files
CREATE INDEX IF NOT EXISTS files_is_publish_idx 
  ON modules.files USING btree (is_publish);

-- Add composite index for cleanup queries
CREATE INDEX IF NOT EXISTS files_unpublished_created_idx 
  ON modules.files USING btree (is_publish, created_at) 
  WHERE is_publish = false;
