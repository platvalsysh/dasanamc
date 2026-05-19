-- Bootstrap migration for the `core` and `modules` schemas plus all `core.*`
-- base tables. Idempotent — safe to apply to existing DBs (CREATE ... IF NOT
-- EXISTS for tables/indexes; FKs are wrapped in pg_constraint checks).
--
-- Why this exists:
--   `pg_dump --schema-only` does not emit CREATE SCHEMA, and the per-table
--   001..008 files in this folder are wrapped in /* */ (documentation
--   snapshots, not executable). This single file is the canonical bootstrap.

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS modules;

CREATE TABLE IF NOT EXISTS core.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  category text NOT NULL,
  is_dangerous boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  level integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.admin_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS core.admin_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  granted_by uuid,
  granted_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  UNIQUE (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS core.configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (scope, key)
);

CREATE TABLE IF NOT EXISTS core.identifiers (
  user_id uuid PRIMARY KEY,
  identifier character varying(255) NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module character varying(255) NOT NULL,
  mid character varying(255) NOT NULL,
  extra_vars jsonb DEFAULT '{}'::jsonb,
  created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS core.profiles (
  user_id uuid PRIMARY KEY,
  display_name text,
  signature text,
  profile_image character varying,
  social_links jsonb DEFAULT '{}'::jsonb,
  description text,
  allow_mailing boolean DEFAULT true,
  allow_message boolean DEFAULT true,
  ban_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  extra_vars jsonb
);

CREATE INDEX IF NOT EXISTS configs_scope_idx ON core.configs USING btree (scope);
CREATE UNIQUE INDEX IF NOT EXISTS modules_mid_key ON core.modules USING btree (mid);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_role_permissions_permission_id_fkey') THEN
    ALTER TABLE core.admin_role_permissions
      ADD CONSTRAINT admin_role_permissions_permission_id_fkey
      FOREIGN KEY (permission_id) REFERENCES core.admin_permissions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_role_permissions_role_id_fkey') THEN
    ALTER TABLE core.admin_role_permissions
      ADD CONSTRAINT admin_role_permissions_role_id_fkey
      FOREIGN KEY (role_id) REFERENCES core.admin_roles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_user_roles_granted_by_fkey') THEN
    ALTER TABLE core.admin_user_roles
      ADD CONSTRAINT admin_user_roles_granted_by_fkey
      FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_user_roles_role_id_fkey') THEN
    ALTER TABLE core.admin_user_roles
      ADD CONSTRAINT admin_user_roles_role_id_fkey
      FOREIGN KEY (role_id) REFERENCES core.admin_roles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_user_roles_user_id_fkey') THEN
    ALTER TABLE core.admin_user_roles
      ADD CONSTRAINT admin_user_roles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'identifiers_user_id_fkey') THEN
    ALTER TABLE core.identifiers
      ADD CONSTRAINT identifiers_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_fkey') THEN
    ALTER TABLE core.profiles
      ADD CONSTRAINT profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
