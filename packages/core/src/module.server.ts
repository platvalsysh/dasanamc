import { createModule } from "./.server/module-builder";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";

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
      description: "대시보드를 조회할 수 있습니다.",
    },
    {
      name: "core.analyst.view",
      display_name: "통계와 분석 조회",
      description: "통계와 분석 데이터를 조회할 수 있습니다.",
    },
    {
      name: "core.analyst.handle",
      display_name: "통계와 분석 처리",
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
      description: "기본적인 콘텐츠 검토 권한만 가진 운영자",
      permission_names: ["*"],
    },
  ])
  .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;

