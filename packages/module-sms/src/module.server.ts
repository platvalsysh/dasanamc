import { createModule } from "@repo/core/server";
import { routesAdmin, routesPublic, routesApi } from "./routes.server";

export const module = createModule("sms")
  .routes({
    public: routesPublic,
    admin: routesAdmin,
    api: routesApi
  })
  .permissions([
    // Define minimal permissions for now
    {
      name: "sms.config",
      display_name: "SMS Configuration",
      description: "Manage SMS settings and profiles",
      is_dangerous: true,
    },
  ])
  .adminMenuItemUnits([
    {
      id: "sms-config",
      label: "SMS 설정",
      icon: "MessageSquare",
      path: "/admin/sms",
      permission: "sms.config",
      group: "시스템",
      order: 80,
    },
  ])
  .build();
