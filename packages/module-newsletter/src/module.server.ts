import { createModule } from "@repo/core/server";
import { type InferPermissionName } from "@repo/core/types";
import { routesPublic, routesAdmin } from "./routes.server";

export const module = createModule("newsletter")
    .routes({
        public: routesPublic,
        admin: routesAdmin,
    })
    .permissions([
        {
            name: "newsletter.manage",
            display_name: "동창회보 관리",
            description: "동창회보를 생성, 삭제할 수 있음",
            is_dangerous: true,
        },
    ])
    .adminMenuItemUnits([
        {
            id: "newsletters",
            label: "동창회보",
            icon: "BookOpen", // Using BookOpen icon
            path: "/admin/newsletters",
            permission: "newsletter.manage",
        },
    ])
    .build();

export type PermissionName = InferPermissionName<typeof module>;
