import { type RouteConfig } from "@react-router/dev/routes";
import { relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { route: moduleRoute } = relative(__dirname);

export const routesAdmin = [
  moduleRoute("/admin/sms", "./admin/page.tsx"),
  moduleRoute("/admin/sms/console/setting/:profile", "./admin/console/settings.tsx"),
  moduleRoute("/admin/sms/solapi/setting/:profile", "./admin/solapi/settings.tsx"),
  
  // Console Dashboard
  moduleRoute("/admin/sms/console/dashboard/:profile", "./admin/console/dashboard/layout.tsx", [
      moduleRoute("overview", "./admin/console/dashboard/overview.tsx"),
      moduleRoute("test/sms", "./admin/console/dashboard/test/sms.tsx"),
      moduleRoute("test/lms", "./admin/console/dashboard/test/lms.tsx"),
      moduleRoute("test/mms", "./admin/console/dashboard/test/mms.tsx"),
  ]),

  // Solapi Dashboard
  moduleRoute("/admin/sms/solapi/dashboard/:profile", "./admin/solapi/dashboard/layout.tsx", [
    moduleRoute("overview", "./admin/solapi/dashboard/overview.tsx"),
    moduleRoute("history", "./admin/solapi/dashboard/history.tsx"),
    moduleRoute("history-group", "./admin/solapi/dashboard/history-group.tsx"),
    moduleRoute("test/sms", "./admin/solapi/dashboard/test/sms.tsx"),
    moduleRoute("test/lms", "./admin/solapi/dashboard/test/lms.tsx"),
    moduleRoute("test/mms", "./admin/solapi/dashboard/test/mms.tsx"),
    moduleRoute("kakao/channels", "./admin/solapi/dashboard/kakao/channels.tsx"),
    moduleRoute("kakao/channels/:channelId/templates", "./admin/solapi/dashboard/kakao/templates/layout.tsx", [
        moduleRoute("", "./admin/solapi/dashboard/kakao/templates/list.tsx"),
        moduleRoute("new", "./admin/solapi/dashboard/kakao/templates/new.tsx"),
        moduleRoute(":templateId", "./admin/solapi/dashboard/kakao/templates/detail.tsx"),
    ]),
]),
] satisfies RouteConfig;

export const routesPublic = [] satisfies RouteConfig;

export const routesApi = [
  moduleRoute("/admin/api/sms/failover-config", "./admin/api/config/failover.ts"),
] satisfies RouteConfig;
