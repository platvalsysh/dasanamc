#!/bin/bash

# PostgreSQL Dump Script for Migration Files
# This script dumps individual table schemas to their respective migration files

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if DIRECT_URL is set
if [ -z "$DIRECT_URL" ]; then
  echo "Error: DIRECT_URL environment variable is not set"
  exit 1
fi

# Parse connection string to extract components
# Format: postgresql://user:password@host:port/database
DB_URL=$DIRECT_URL

echo "Starting table schema dump..."

# Core package tables
echo "Dumping core schema tables..."

pg_dump "$DB_URL" --table=core.admin_permissions --schema-only --no-owner --no-acl > packages/core/migrate/001_admin_permissions.sql
echo "✓ Dumped admin_permissions"

pg_dump "$DB_URL" --table=core.admin_role_permissions --schema-only --no-owner --no-acl > packages/core/migrate/002_admin_role_permissions.sql
echo "✓ Dumped admin_role_permissions"

pg_dump "$DB_URL" --table=core.admin_roles --schema-only --no-owner --no-acl > packages/core/migrate/003_admin_roles.sql
echo "✓ Dumped admin_roles"

pg_dump "$DB_URL" --table=core.admin_user_roles --schema-only --no-owner --no-acl > packages/core/migrate/004_admin_user_roles.sql
echo "✓ Dumped admin_user_roles"

pg_dump "$DB_URL" --table=core.configs --schema-only --no-owner --no-acl > packages/core/migrate/005_configs.sql
echo "✓ Dumped configs"

pg_dump "$DB_URL" --table=core.identifiers --schema-only --no-owner --no-acl > packages/core/migrate/006_identifiers.sql
echo "✓ Dumped identifiers"

pg_dump "$DB_URL" --table=core.modules --schema-only --no-owner --no-acl > packages/core/migrate/007_modules.sql
echo "✓ Dumped modules"

pg_dump "$DB_URL" --table=core.profiles --schema-only --no-owner --no-acl > packages/core/migrate/008_profiles.sql
echo "✓ Dumped profiles"

# Module-bxmember package tables
echo "Dumping modules schema tables (bxmember)..."

pg_dump "$DB_URL" --table=modules.bxmember --schema-only --no-owner --no-acl > packages/module-bxmember/migrate/001_bxmember.sql
echo "✓ Dumped bxmember"

pg_dump "$DB_URL" --table=modules.bxprofessor --schema-only --no-owner --no-acl > packages/module-bxmember/migrate/002_bxprofessor.sql
echo "✓ Dumped bxprofessor"

# Module-board package tables
echo "Dumping modules schema tables (board)..."

pg_dump "$DB_URL" --table=modules.comments --schema-only --no-owner --no-acl > packages/module-board/migrate/001_comments.sql
echo "✓ Dumped comments"

pg_dump "$DB_URL" --table=modules.documents --schema-only --no-owner --no-acl > packages/module-board/migrate/002_documents.sql
echo "✓ Dumped documents"

pg_dump "$DB_URL" --table=modules.files --schema-only --no-owner --no-acl > packages/module-board/migrate/003_files.sql
echo "✓ Dumped files"

echo ""
echo "✅ All table schemas dumped successfully!"
echo ""
echo "Note: You may need to manually adjust the dumped SQL files to:"
echo "  - Remove any unwanted comments or metadata"
echo "  - Ensure proper schema references"
echo "  - Add any necessary seed data"
