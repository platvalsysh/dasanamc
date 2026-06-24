import { type RouteConfigEntry, route, layout } from "@react-router/dev/routes";
import { configRoutesFixId } from "@repo/core/server";
import { moduleManager } from "@repo/core/server";
import { modules } from "./modules.server";

if (!moduleManager.isRegistered()) {
  moduleManager.register(modules);
}


const routes: RouteConfigEntry[] = [
  layout("./layouts/default.tsx", [
    route("/", "./routes/home.tsx"),

    route("/about/greeting", "./routes/about/greeting.tsx"),
    route("/about/info", "./routes/about/info.tsx"),
    route("/about/contact", "./routes/about/contact.tsx"),
    // Chrome DevTools Noise Filter
    route("/.well-known/appspecific/com.chrome.devtools.json", "./routes/splinter.tsx"),

    route("/rules", "./routes/rules.tsx"),
    route("/privacy", "./routes/privacy.tsx"),
    route("/email-reject", "./routes/email-reject.tsx"),

    ...moduleManager.getRoutes("public"),
  ]),

  layout("./layouts/admin.tsx", [
    //
    ...moduleManager.getRoutes("admin"),
  ]),

  ...moduleManager.getRoutes("api"),
];

configRoutesFixId(routes);
// const test = configRoutesToRouteManifest(routes);
export default routes;
