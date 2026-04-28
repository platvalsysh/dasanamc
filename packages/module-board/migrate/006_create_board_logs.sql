-- Document Read History (Member Only - Last Viewed Strategy)
CREATE TABLE IF NOT EXISTS modules.document_read_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES modules.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Unique per user+doc to allow "update last viewed time" (Upsert support)
CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_read_hist_unique ON modules.document_read_history(document_id, user_id);
-- History lookup index
CREATE INDEX IF NOT EXISTS idx_doc_read_hist_user_time ON modules.document_read_history(user_id, created_at DESC);


-- Document IP View Log (Guest / Abuse Prevention)
CREATE TABLE IF NOT EXISTS modules.document_ip_view_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES modules.documents(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Check recent views by IP
CREATE INDEX IF NOT EXISTS idx_doc_ip_view_check ON modules.document_ip_view_log(ip_address, document_id, created_at);


-- Document Vote Log (Members Only)
CREATE TABLE IF NOT EXISTS modules.document_vote_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES modules.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    vote_type VARCHAR(10) NOT NULL, -- 'LIKE', 'BLAME'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Unique vote
CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_vote_member ON modules.document_vote_log(document_id, user_id, vote_type);
-- History lookup
CREATE INDEX IF NOT EXISTS idx_doc_vote_user_time ON modules.document_vote_log(user_id, created_at DESC);


-- Comment Vote Log (Members Only)
CREATE TABLE IF NOT EXISTS modules.comment_vote_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES modules.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    vote_type VARCHAR(10) NOT NULL, -- 'LIKE', 'BLAME'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Unique vote
CREATE UNIQUE INDEX IF NOT EXISTS idx_cmt_vote_member ON modules.comment_vote_log(comment_id, user_id, vote_type);
-- History lookup
CREATE INDEX IF NOT EXISTS idx_cmt_vote_user_time ON modules.comment_vote_log(user_id, created_at DESC);
