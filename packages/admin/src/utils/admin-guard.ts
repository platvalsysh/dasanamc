import type { RouterContextProvider } from "react-router";
import { useAuthServerContext, type Auth } from "@repo/auth/server";

/**
 * admin 라우트 권한 가드 헬퍼.
 *
 * 각 loader / action 첫 줄에서 호출. 권한 미충족 시 즉시 `Response(403)` throw.
 * audit C1 — admin POST action 들이 권한 체크 없이 동작하던 문제 일괄 차단.
 *
 * - settings 페이지의 loader 는 `admin.settings.view`
 * - settings 페이지의 action(저장)은 `admin.settings.edit`
 * - admin.* 와일드카드 보유자는 모두 통과
 */
export function requireSettingsView(
  context: Readonly<RouterContextProvider>,
): Auth {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["admin.settings.view", "admin.*"]);
  return auth;
}

export function requireSettingsEdit(
  context: Readonly<RouterContextProvider>,
): Auth {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["admin.settings.edit", "admin.*"]);
  return auth;
}

export function requireModulesManage(
  context: Readonly<RouterContextProvider>,
): Auth {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["admin.modules.manage", "admin.*"]);
  return auth;
}
