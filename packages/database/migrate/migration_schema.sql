-- Create migration schema
CREATE SCHEMA IF NOT EXISTS migration;

-- Member Mapping
CREATE TABLE IF NOT EXISTS migration.member_map (
    user_id UUID NOT NULL,
    member_srl BIGINT NOT NULL,
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id),
    UNIQUE (member_srl)
);

-- Document Mapping
CREATE TABLE IF NOT EXISTS migration.document_map (
    document_id UUID NOT NULL,
    document_srl BIGINT NOT NULL,
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (document_id),
    UNIQUE (document_srl)
);

-- Comment Mapping
CREATE TABLE IF NOT EXISTS migration.comment_map (
    comment_id UUID NOT NULL,
    comment_srl BIGINT NOT NULL,
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (comment_id),
    UNIQUE (comment_srl)
);

-- File Mapping
CREATE TABLE IF NOT EXISTS migration.file_map (
    file_id UUID NOT NULL,
    file_srl BIGINT NOT NULL,
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (file_id),
    UNIQUE (file_srl)
);
