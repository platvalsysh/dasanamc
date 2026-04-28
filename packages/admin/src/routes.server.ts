import { type RouteConfig } from "@react-router/dev/routes";
import { relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { route: moduleRoute, layout: moduleLayout } = relative(__dirname);

export const routesAdmin = [
  moduleRoute("/admin", "./routes/_index.tsx"),
  moduleRoute("/admin/menu", "./routes/menu.tsx"),
  moduleLayout("./routes/system/settings/_layout.tsx", [
    moduleRoute("/admin/system/settings", "./routes/system/settings/general.tsx"),
    moduleRoute("/admin/system/settings/general", "./routes/system/settings/general.tsx"),
    moduleRoute("/admin/system/settings/menu", "./routes/system/settings/menu.tsx"),
    moduleRoute("/admin/system/settings/appearance", "./routes/system/settings/appearance.tsx"),
    moduleRoute("/admin/system/settings/email", "./routes/system/settings/email.tsx"),
    moduleRoute("/admin/system/settings/notifications", "./routes/system/settings/notifications.tsx"),
    moduleRoute("/admin/system/settings/security", "./routes/system/settings/security.tsx"),
    moduleRoute("/admin/system/settings/database", "./routes/system/settings/database.tsx"),
    moduleRoute("/admin/system/settings/api", "./routes/system/settings/api.tsx"),
    moduleRoute("/admin/system/settings/server", "./routes/system/settings/server.tsx"),
    moduleRoute("/admin/system/settings/installed-modules", "./routes/system/settings/installed-modules.tsx"),
    moduleRoute("/admin/system/settings/modules", "./routes/system/settings/modules.tsx"),
  ]),
] satisfies RouteConfig;
