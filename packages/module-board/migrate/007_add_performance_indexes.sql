-- Indexes for Performance

-- 1. Threaded Comments Hierarchy
-- Optimized for: SELECT * FROM comments WHERE document_id = ? ORDER BY head, arrange
CREATE INDEX IF NOT EXISTS idx_comments_hierarchy ON modules.comments(document_id, head, arrange);

-- 2. Document Listing (Standard Board View)
-- Optimized for: SELECT * FROM documents WHERE module_id = ? ORDER BY is_notice DESC, created_at DESC
-- Note: 'is_notice' puts pinned posts first.
CREATE INDEX IF NOT EXISTS idx_documents_listing ON modules.documents(module_id, is_notice DESC, created_at DESC);

-- 3. Popular Posts (By Views)
CREATE INDEX IF NOT EXISTS idx_documents_view_ranking ON modules.documents(module_id, view_count DESC);

-- 4. Popular Posts (By Likes)
CREATE INDEX IF NOT EXISTS idx_documents_like_ranking ON modules.documents(module_id, like_count DESC);
