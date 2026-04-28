import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesAdmin, routesPublic } from "./routes.server";

export const module = createModule("sponsors")
    .routes({
        public: routesPublic,
        admin: routesAdmin,
    })
    .permissions([
        {
            name: "sponsors.manage",
            display_name: "후원기업 관리",
            description: "후원기업을 생성, 수정, 삭제할 수 있음",
            is_dangerous: true,
        },
    ])
    .adminMenuItemUnits([
        {
            id: "sponsors",
            label: "후원기업 관리",
            icon: "Building",
            path: "/admin/sponsors",
            permission: "sponsors.manage",
        },
    ])
    .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;
