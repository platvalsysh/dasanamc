import { module as auth } from "@repo/auth/module";
import { module as admin } from "@repo/admin/module";
import { module as board } from "@repo/module-board/module";
import { module as file } from "@repo/module-file/module";
import { module as core } from "@repo/core/module";
import { module as sms } from "@repo/module-sms/module";
import { ENABLED_MODULES } from "@repo/env/server";

// 사이트에 끼울 수 있는 후보 모듈 전체 (편집 모듈은 사용처에 따라 추가).
const allModules = [
  core,
  auth,
  admin,
  board,
  file,
  sms,
];

// 화이트리스트 환경변수와 무관하게 항상 활성화되는 필수 모듈.
const ALWAYS_ON = new Set(["core", "auth", "admin"]);

/**
 * 실제 라우트/메뉴/권한에 등록될 모듈 배열.
 *
 * `ENABLED_MODULES` 미설정/빈 값이면 `allModules` 전체.
 * 설정되어 있으면 화이트리스트 ∪ ALWAYS_ON 만 등록.
 */
const enabledList = ENABLED_MODULES;
export const modules =
  enabledList === null
    ? allModules
    : allModules.filter(
        (m) => ALWAYS_ON.has(m.name) || enabledList.includes(m.name),
      );

if (ENABLED_MODULES !== null) {
  const enabled = modules.map((m) => m.name).join(", ");
  const skipped = allModules
    .filter((m) => !modules.includes(m))
    .map((m) => m.name);
  console.log(`[modules] enabled: ${enabled}`);
  if (skipped.length > 0) {
    console.log(`[modules] skipped: ${skipped.join(", ")}`);
  }
}
