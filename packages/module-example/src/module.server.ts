import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesAdmin, routesApi, routesPublic } from "./routes.server";

export const module = createModule("example")
  .routes({
    public: routesPublic,
    admin: routesAdmin,
    api: routesApi,
  })
  .permissions([
    {
      name: "example.*",
      display_name: "모든 권한",
      description: "모든 권한",
      is_dangerous: true,
    },
    {
      name: "example.list",
      display_name: "목록 조회",
      description: "",
    },
    {
      name: "example.create",
      display_name: "생성",
      description: "",
    },
    {
      name: "example.view",
      display_name: "조회",
      description: "",
    },
    {
      name: "example.edit",
      display_name: "수정",
      description: "",
    },
    {
      name: "example.delete",
      display_name: "삭제",
      description: "",
      is_dangerous: true,
    },
  ])
  .roles([
    {
      name: "ROLE_EXAMPLE_VIEWER",
      display_name: "Viewer",
      description: "",
      permission_names: ["example.list"],
    },
  ])
  .adminMenuItemUnits([
    {
      id: "example-dashboard",
      label: "Example Dashboard",
      icon: "layout-dashboard",
      path: "/admin/example",
      permission: "example.view",
    },
    {
      id: "example-list",
      label: "Example List",
      icon: "layout-dashboard",
      path: "/admin/example/list",
      permission: "example.view",
    },
    {
      id: "example-create",
      label: "Example Create",
      icon: "layout-dashboard",
      path: "/admin/example/create",
      permission: "example.create",
    },
  ])
  .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;

