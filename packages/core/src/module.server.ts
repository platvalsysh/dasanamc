import { createModule } from "./.server/module-builder";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";

/**
 * core 모듈 — 인프라 핵심 권한/역할, 그리고 admin 대시보드 메뉴 선언.
 *
 * core 만 권한 와일드카드 `*` 사용 가능 (운영자 전권).
 */
export const module = createModule("core")
  .permissions([
    {
      name: "*",
      display_name: "운영자",
      description: "모든 권한을 가진 운영자",
    },
    {
      name: "core.dashboard.view",
      display_name: "대시보드 조회",
      description: "관리자 대시보드를 조회할 수 있습니다.",
    },
    {
      name: "core.analyst.view",
      display_name: "통계 조회",
      description: "통계와 분석 데이터를 조회할 수 있습니다.",
    },
    {
      name: "core.analyst.handle",
      display_name: "통계 처리",
      description: "통계와 분석 데이터를 처리할 수 있습니다.",
    },
  ])
  .roles([
    {
      name: "super_admin",
      display_name: "최고 관리자",
      description: "모든 권한을 가진 최고 관리자",
      permission_names: ["*"],
    },
    {
      name: "moderator",
      display_name: "운영자",
      description: "기본 콘텐츠 검토 권한을 가진 운영자",
      permission_names: ["core.dashboard.view"],
    },
  ])
  .adminMenuItemUnits([
    {
      id: "dashboard",
      label: "대시보드",
      icon: "LayoutDashboard",
      path: "/admin",
      permission: "core.dashboard.view",
      // group 미지정 → 그룹 1개·항목 1개라 평면화되어 사이드바 상단에 단독 노출
      order: 0,
    },
  ])
  .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;
