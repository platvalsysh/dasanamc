CREATE TABLE modules.bxmember_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    extra_vars jsonb DEFAULT '{}'::jsonb,
    deleted_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modules.bxmember_group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    group_id uuid NOT NULL REFERENCES modules.bxmember_groups(id) ON DELETE CASCADE,
    type text, -- 'MEMBER', 'PROFESSOR', 'DIRECT'
    name text,
    cellphone_number text,
    email text,
    ref_data jsonb DEFAULT '{}'::jsonb,
    extra_vars jsonb DEFAULT '{}'::jsonb,
    member_id integer REFERENCES modules.bxmember(seq) ON DELETE SET NULL,
    professor_id bigint REFERENCES modules.bxprofessor(seq) ON DELETE SET NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bxmember_group_members_group_id ON modules.bxmember_group_members(group_id);
CREATE INDEX idx_bxmember_group_members_member_id ON modules.bxmember_group_members(member_id);
CREATE INDEX idx_bxmember_group_members_professor_id ON modules.bxmember_group_members(professor_id);
