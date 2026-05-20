import AdminLayout from "@repo/layout-admin/layout";
import {
  type LoaderFunctionArgs,
  redirect,
  type RouterContextProvider,
  useLoaderData,
} from "react-router";
import { useAuthServerContext } from "@repo/auth/server";
import { getAdminMenu, moduleManager } from "@repo/core/server";

/**
 * /admin/* 진입 시 2단계 가드:
 * 1. 미로그인 → /auth/login 으로 redirect (UX)
 * 2. 로그인했지만 admin 메뉴 권한이 전혀 없으면 → 403
 *
 * audit C1 의 "admin POST action 권한 가드" 의 backstop 역할. 각 라우트의
 * 액션 가드와 함께 defense-in-depth 를 형성. 특히 module-sms 등 라우트 자체
 * 의 가드가 순환의존으로 불가능한 곳에서 유일한 차단점.
 *
 * 권한 집합은 활성 모듈의 `adminMenuItemUnits` 가 선언한 권한 + admin.* 와일드카드.
 */
export async function loader({
  request,
  context,
}: LoaderFunctionArgs<RouterContextProvider>) {
  const auth = useAuthServerContext(context);
  const isLogged = auth.isLogged();
  if (!isLogged) {
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;
    throw redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  // 활성 모듈이 admin 메뉴에 노출한 모든 permission 을 모아 user 가 그 중
  // 하나라도 갖고 있는지 검사. super_admin / admin.* / auth.* 등 와일드카드도
  // checkPermissions 가 인식.
  if (!auth.isSuperAdmin()) {
    const allAdminPerms = new Set<string>(["admin.*"]);
    const walk = (units: ReadonlyArray<{ permission?: string | string[] | readonly string[]; children?: ReadonlyArray<any> }>) => {
      for (const u of units) {
        if (u.permission) {
          if (Array.isArray(u.permission)) {
            for (const p of u.permission) allAdminPerms.add(p);
          } else {
            allAdminPerms.add(u.permission as string);
          }
        }
        if (u.children && u.children.length > 0) walk(u.children);
      }
    };
    for (const m of Object.values(moduleManager.getModules())) {
      if (m.adminMenuItemUnits) walk(m.adminMenuItemUnits);
    }

    if (!auth.checkPermissions(Array.from(allAdminPerms))) {
      throw new Response("관리자 영역에 접근할 권한이 없습니다.", {
        status: 403,
      });
    }
  }

  const menuConfig = await getAdminMenu();

  return { menuConfig };
}

export default function Layout() {
  const { menuConfig } = useLoaderData<typeof loader>();

  return <AdminLayout menuItems={menuConfig} />;
}
