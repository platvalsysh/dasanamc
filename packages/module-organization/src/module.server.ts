import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesAdmin, routesPublic } from "./routes.server";

export const module = createModule("organization")
    .routes({
        public: routesPublic,
        admin: routesAdmin,
    })
    .permissions([
        {
            name: "organization.manage",
            display_name: "조직도 관리",
            description: "임원진 조직도 및 구성원을 관리할 수 있음",
            is_dangerous: true,
        },
    ])
    .adminMenuItemUnits([
        {
            id: "organization",
            label: "조직도/임원 관리",
            icon: "Users",
            path: "/admin/organization",
            permission: "organization.manage",
        },
    ])
    .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;
