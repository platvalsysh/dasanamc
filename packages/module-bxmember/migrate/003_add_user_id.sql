-- Add user_id column to bxmember
ALTER TABLE modules.bxmember ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add Foreign Key constraint (Relation to auth.users)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_bxmember_users'
    ) THEN
        ALTER TABLE modules.bxmember
        ADD CONSTRAINT fk_bxmember_users
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE SET NULL;
    END IF;
END $$;
