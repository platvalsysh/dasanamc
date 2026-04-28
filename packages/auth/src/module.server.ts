
import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesAdmin, routesPublic } from "./routes.server";

export const module = createModule("auth")
  .routes({
    public: routesPublic,
    admin: routesAdmin,
  })
  .permissions([
    {
      name: "auth.*",
      display_name: "모든 권한",
      description: "모든 권한",
      is_dangerous: true,
    },
    {
      name: "auth.users.view",
      display_name: "사용자 목록 조회",
    },
    {
      name: "auth.users.create",
      display_name: "사용자 생성",
    },
    {
      name: "auth.users.edit",
      display_name: "사용자 수정",
    },
    {
      name: "auth.users.delete",
      display_name: "사용자 삭제",
      is_dangerous: true,
    },
  ])
  .adminMenuItemUnits([
    {
      id: "users-list",
      label: "사용자 목록",
      icon: "Users",
      path: "/admin/users",
      permission: "auth.users.view",
    },
    {
      id: "users-roles",
      label: "권한 관리",
      icon: "Settings",
      path: "/admin/users/roles",
      permission: "auth.users.view",
    },
    {
      id: "users-assign-roles",
      label: "역할 부여",
      icon: "User",
      path: "/admin/users/assign-roles",
      permission: ["auth.users.create", "auth.users.edit"],
    },
  ])
  .build();


export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;

