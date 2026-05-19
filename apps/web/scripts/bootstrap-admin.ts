/**
 * Bootstrap the first super_admin user.
 *
 * 닭-달걀 문제: /admin/users UI 는 super_admin 권한이 필요한데, 그 권한을
 * 가진 첫 사용자가 없으면 들어갈 수가 없음. 이 스크립트가 그 첫 사용자를
 * Supabase auth + core.profiles + core.admin_user_roles 에 직접 꽂아 넣음.
 *
 * 사용법:
 *   pnpm --filter web tsx scripts/bootstrap-admin.ts \
 *     --email admin@example.com \
 *     --password 'StrongPass!1' \
 *     [--display-name "최고관리자"]
 *
 * 사전 조건:
 *   - `pnpm db:migrate` 가 한 번 실행되어 스키마 존재
 *   - `pnpm --filter web db:init-permissions` 로 admin_roles 가 시드된 상태
 *   - .env 에 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 있어야 admin API 사용 가능
 *
 * 멱등성:
 *   - 이미 같은 이메일의 auth 유저가 있으면 그 유저에 super_admin 역할만 부여
 *   - 이미 super_admin 역할이 활성화돼 있으면 no-op
 */

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@repo/database";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@repo/env/server";

function parseArgs(): { email: string; password: string; displayName: string } {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
  };
  const email = get("--email");
  const password = get("--password");
  const displayName = get("--display-name") ?? "최고관리자";

  if (!email || !password) {
    console.error("Usage: tsx scripts/bootstrap-admin.ts --email <e> --password <p> [--display-name <n>]");
    process.exit(1);
  }
  return { email, password, displayName };
}

async function findOrCreateAuthUser(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string,
  password: string,
  displayName: string,
): Promise<string> {
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) throw new Error(`listUsers failed: ${listErr.message}`);
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    console.log(`ℹ️  Auth user already exists: ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message ?? "no user returned"}`);
  console.log(`✅ Created auth user: ${data.user.id}`);
  return data.user.id;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  }

  const { email, password, displayName } = parseArgs();
  console.log(`🚀 Bootstrapping super_admin for ${email} ...\n`);

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const userId = await findOrCreateAuthUser(supabaseAdmin, email, password, displayName);

  await prisma.profiles.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      display_name: displayName,
      allow_mailing: true,
      allow_message: true,
      extra_vars: {},
    },
    update: { display_name: displayName },
  });
  console.log(`✅ Upserted core.profiles for ${userId}`);

  const superAdmin = await prisma.admin_roles.findUnique({ where: { name: "super_admin" } });
  if (!superAdmin) {
    throw new Error("super_admin role missing. Run `pnpm --filter web db:init-permissions` first.");
  }

  await prisma.admin_user_roles.upsert({
    where: { user_id_role_id: { user_id: userId, role_id: superAdmin.id } },
    create: { user_id: userId, role_id: superAdmin.id, is_active: true },
    update: { is_active: true, expires_at: null },
  });
  console.log(`✅ Granted super_admin role\n`);

  console.log(`🎉 Done. Login as ${email} to access /admin.`);
}

main()
  .catch((e) => {
    console.error("❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
