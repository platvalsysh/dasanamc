import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesAdmin } from "./routes.server";

/**
 * admin 모듈 — 시스템 설정 페이지 + 사이트 메뉴 빌더 등을 노출.
 *
 * 권한 카테고리:
 * - `admin.settings.*` : 일반/외관/이메일/알림/보안/DB/API/서버 등 시스템 설정 페이지 접근
 * - `admin.menu.manage` : 사이트/관리자 메뉴 빌더
 * - `admin.modules.manage` : 모듈 인스턴스 관리 (설치/제거)
 */
export const module = createModule("admin")
  .routes({
    admin: routesAdmin,
  })
  .permissions([
    {
      name: "admin.*",
      display_name: "관리자 전체",
      description: "admin 패키지의 모든 권한",
      is_dangerous: true,
    },
    {
      name: "admin.settings.view",
      display_name: "시스템 설정 조회",
    },
    {
      name: "admin.settings.edit",
      display_name: "시스템 설정 변경",
      is_dangerous: true,
    },
    {
      name: "admin.menu.manage",
      display_name: "메뉴 관리",
      description: "사이트 / 관리자 메뉴 빌더를 사용할 수 있습니다.",
    },
    {
      name: "admin.modules.manage",
      display_name: "모듈 인스턴스 관리",
      description: "게시판 등 모듈 인스턴스를 추가/삭제할 수 있습니다.",
      is_dangerous: true,
    },
  ])
  .adminMenuItemUnits([
    {
      id: "admin-menu-builder",
      label: "사이트 메뉴",
      icon: "Menu",
      path: "/admin/menu",
      permission: "admin.menu.manage",
      group: "시스템",
      order: 90,
    },
    {
      id: "admin-settings-general",
      label: "일반 설정",
      icon: "Settings",
      path: "/admin/system/settings/general",
      permission: "admin.settings.view",
      group: "시스템",
      order: 91,
    },
    {
      id: "admin-settings-menu",
      label: "관리자 메뉴",
      icon: "ListTree",
      path: "/admin/system/settings/menu",
      permission: "admin.menu.manage",
      group: "시스템",
      order: 92,
    },
    {
      id: "admin-installed-modules",
      label: "설치된 모듈",
      icon: "Package",
      path: "/admin/system/settings/installed-modules",
      permission: "admin.modules.manage",
      group: "시스템",
      order: 93,
    },
  ])
  .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;
