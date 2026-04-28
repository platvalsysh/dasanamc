import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesAdmin } from "./routes.server";

export const module = createModule("admin")
  .routes({
    admin: routesAdmin,
  })
  .adminMenuItemUnits([
    {
      id: "site-menu",
      label: "사이트 메뉴",
      path: "/admin/menu",
      icon: "Menu",
    },
  ])
  .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;

