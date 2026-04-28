-- Change head to BigInt for sorting
DROP INDEX IF EXISTS modules.idx_comments_hierarchy;

-- Sequence for new threads (Create FIRST so we can use it as default)
CREATE SEQUENCE IF NOT EXISTS modules.seq_comments_head AS BIGINT START 1;

-- We drop and recreate because casting UUID to Integer isn't valid
ALTER TABLE modules.comments DROP COLUMN IF EXISTS head;
ALTER TABLE modules.comments ADD COLUMN head BIGINT DEFAULT nextval('modules.seq_comments_head');

-- Recreate Index
CREATE INDEX idx_comments_hierarchy ON modules.comments(document_id, head, arrange);
