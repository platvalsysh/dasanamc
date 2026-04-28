-- Create files table in modules schema
-- This table stores file metadata for all modules supporting file uploads

CREATE TABLE IF NOT EXISTS modules.files
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),

    -- Module identification
    module character varying(255) NOT NULL, -- Module name (e.g., 'comments', 'documents', 'ambassador')
    module_id uuid, -- Reference to core.modules.id for dynamic sub-modules
    target_id uuid, -- Target entity ID (e.g., modules.comments.id, modules.documents.id)

    -- File metadata
    original_name   VARCHAR(255) NOT NULL,
    file_size       BIGINT NOT NULL,
    mime_type       VARCHAR(255),
    extension       VARCHAR(255),

    -- Storage configuration
    storage_type    VARCHAR(10) NOT NULL 
                    CHECK (storage_type IN ('local', 's3')),

    -- Local storage information
    local_path      TEXT,

    -- S3 storage information
    s3_bucket       VARCHAR(100),
    s3_key          TEXT,
    s3_region       VARCHAR(50),

    -- Upload status: 'P'=Processing, 'U'=Uploaded, 'F'=Failed
    status          CHAR(1) NOT NULL DEFAULT 'P',

    -- Timestamps
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_at     TIMESTAMP WITH TIME ZONE,

    -- User tracking
    uploaded_by     UUID, -- Reference to auth.users.id

    -- Statistics
    download_count  BIGINT NOT NULL DEFAULT 0,

    -- Primary key
    CONSTRAINT files_pkey PRIMARY KEY (id)
);

-- Foreign key constraints
ALTER TABLE modules.files
    ADD CONSTRAINT files_module_id_fkey
    FOREIGN KEY (module_id)
    REFERENCES core.modules(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

ALTER TABLE modules.files
    ADD CONSTRAINT files_uploaded_by_fkey
    FOREIGN KEY (uploaded_by)
    REFERENCES auth.users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS files_module_idx ON modules.files USING btree (module);
CREATE INDEX IF NOT EXISTS files_module_id_idx ON modules.files USING btree (module_id);
CREATE INDEX IF NOT EXISTS files_target_id_idx ON modules.files USING btree (target_id);
CREATE INDEX IF NOT EXISTS files_uploaded_by_idx ON modules.files USING btree (uploaded_by);
CREATE INDEX IF NOT EXISTS files_status_idx ON modules.files USING btree (status);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON modules.files USING btree (created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS files_module_target_idx ON modules.files USING btree (module, target_id);
