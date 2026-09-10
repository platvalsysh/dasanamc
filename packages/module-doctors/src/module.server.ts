import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesAdmin, routesApi, routesPublic } from "./routes.server";

/**
 * 의료진 관리 모듈.
 *
 * - 공개 페이지는 apps/web (의료진 소개·센터 상세) 가 `DoctorsService` 로 직접 읽는다.
 * - admin 에서 프로필 등록/수정/삭제 + 사진 업로드(module-file).
 * - `moderator`(운영자) 역할에 `doctors.*` 를 부여 — core 가 선언한 같은 역할과
 *   합집합으로 동기화된다 (ModuleManager.syncRoles).
 */
export const module = createModule("doctors")
  .routes({
    public: routesPublic,
    admin: routesAdmin,
    api: routesApi,
  })
  .permissions([
    {
      name: "doctors.*",
      display_name: "의료진 모든 권한",
      description: "의료진 관리의 모든 권한",
      is_dangerous: true,
    },
    {
      name: "doctors.list",
      display_name: "의료진 목록 조회",
      description: "admin 에서 의료진 목록을 볼 수 있습니다.",
    },
    {
      name: "doctors.edit",
      display_name: "의료진 등록·수정",
      description: "의료진 프로필을 등록하고 수정할 수 있습니다.",
    },
    {
      name: "doctors.delete",
      display_name: "의료진 삭제",
      description: "의료진 프로필을 삭제할 수 있습니다.",
      is_dangerous: true,
    },
  ])
  .roles([
    {
      // core 의 moderator 와 같은 역할 — 권한은 합집합으로 병합됨
      name: "moderator",
      display_name: "운영자",
      description: "기본 콘텐츠 검토 권한을 가진 운영자",
      permission_names: ["doctors.*"],
    },
  ])
  .adminMenuItemUnits([
    {
      id: "doctors-list",
      label: "의료진 관리",
      icon: "Users",
      path: "/admin/doctors",
      permission: "doctors.list",
      group: "콘텐츠",
      order: 20,
    },
  ])
  .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;
