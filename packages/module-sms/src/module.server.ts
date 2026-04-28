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
  ]).adminMenuItemUnits([
    {
      id: "sms.config",
      label: "SMS 설정",
      icon: "message-square",
      path: "/admin/sms",
    }
  ])
  .build();
