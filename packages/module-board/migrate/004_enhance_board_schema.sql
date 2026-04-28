-- Enhance Documents Table
ALTER TABLE modules.documents
ADD COLUMN IF NOT EXISTS extra_vars JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_notice BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_secret BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Enhance Comments Table
ALTER TABLE modules.comments
ADD COLUMN IF NOT EXISTS extra_vars JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_secret BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parent_id UUID,
ADD COLUMN IF NOT EXISTS head UUID,
ADD COLUMN IF NOT EXISTS arrange INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0;

-- Add Foreign Key for parent_id in comments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_comments_parent'
    ) THEN
        ALTER TABLE modules.comments
        ADD CONSTRAINT fk_comments_parent
        FOREIGN KEY (parent_id)
        REFERENCES modules.comments(id)
        ON DELETE CASCADE;
    END IF;
END $$;
