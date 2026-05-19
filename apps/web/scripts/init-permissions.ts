/**
 * 활성 모듈이 선언한 권한 / 역할 / 역할-권한 매핑을 DB 에 시드한다.
 *
 * 이 스크립트는 단일 진입점이다 — 옛 chemeng 시점에는 `packages/auth/src/types/
 * permissions.ts` 의 하드코딩 478줄을 시드로 썼지만, 이제 모듈이 자기 권한을
 * `createModule(...).permissions([...])` / `.roles([...])` 로 선언하고 그것을
 * 그대로 DB 에 upsert. ENABLED_MODULES 로 비활성화된 모듈은 자동으로 시드 대상
 * 밖이 된다.
 *
 * 사용:  pnpm --filter web db:init-permissions
 */

import { moduleManager } from "@repo/core/server";
import { prisma } from "@repo/database";
import { modules } from "../app/modules.server";

async function main() {
  console.log("🚀 Starting permissions initialization...\n");

  // 1. 활성 모듈을 ModuleManager 에 등록
  moduleManager.register(modules);
  console.log(
    `📦 Registered modules: ${modules.map((m) => m.name).join(", ")}\n`,
  );

  // 2. 각 모듈의 권한 / 역할 / 역할-권한 매핑을 upsert
  await moduleManager.syncWithDatabase();

  // 3. 결과 통계
  const [permissions, roles, mappings] = await Promise.all([
    prisma.admin_permissions.count(),
    prisma.admin_roles.count(),
    prisma.admin_role_permissions.count(),
  ]);
  console.log(`\n✅ DB 현재 상태:`);
  console.log(`   - admin_permissions: ${permissions} 행`);
  console.log(`   - admin_roles: ${roles} 행`);
  console.log(`   - admin_role_permissions: ${mappings} 행`);
  console.log("\n🎉 Permissions initialization completed.");
}

main()
  .catch((e) => {
    console.error("❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
