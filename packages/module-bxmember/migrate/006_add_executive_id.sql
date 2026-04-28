ALTER TABLE modules.bxmember_group_members ADD COLUMN executive_id uuid REFERENCES modules.organization_members(id) ON DELETE SET NULL;
CREATE INDEX idx_bxmember_group_members_executive_id ON modules.bxmember_group_members(executive_id);
