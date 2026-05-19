-- Bootstrap migration for `module-board` base tables (modules.documents,
-- modules.comments) plus their FKs. Idempotent.
--
-- Requires `core/000_init.sql` (creates `core.modules` and the `modules`
-- schema). Numbered `001_` so it sorts after `000_init.sql` globally.

CREATE TABLE IF NOT EXISTS modules.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL,
  title character varying(255) NOT NULL,
  content text,
  author_id uuid,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modules.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  content text NOT NULL,
  author_id uuid,
  created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS documents_author_id_idx ON modules.documents USING btree (author_id);
CREATE INDEX IF NOT EXISTS documents_module_id_idx ON modules.documents USING btree (module_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON modules.comments USING btree (author_id);
CREATE INDEX IF NOT EXISTS comments_document_id_idx ON modules.comments USING btree (document_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_author_id_fkey') THEN
    ALTER TABLE modules.documents
      ADD CONSTRAINT documents_author_id_fkey
      FOREIGN KEY (author_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_module_id_fkey') THEN
    ALTER TABLE modules.documents
      ADD CONSTRAINT documents_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES core.modules(id) ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_author_id_fkey') THEN
    ALTER TABLE modules.comments
      ADD CONSTRAINT comments_author_id_fkey
      FOREIGN KEY (author_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_document_id_fkey') THEN
    ALTER TABLE modules.comments
      ADD CONSTRAINT comments_document_id_fkey
      FOREIGN KEY (document_id) REFERENCES modules.documents(id) ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;
END $$;
