import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesPublic, routesAdmin } from "./routes.server";

export const module = createModule("schedule")
    .routes({
        public: routesPublic,
        admin: routesAdmin,
    })
    .permissions([
        {
            name: "schedule.manage",
            display_name: "일정 관리",
            description: "연간 일정을 등록, 수정, 삭제할 수 있음",
            is_dangerous: false,
        },
    ])
    .adminMenuItemUnits([
        {
            id: "schedules",
            label: "일정 관리",
            icon: "Calendar",
            path: "/admin/schedules",
            permission: "schedule.manage",
        },
    ])
    .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;
