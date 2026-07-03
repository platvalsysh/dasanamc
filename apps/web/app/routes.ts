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

    // /about 그룹
    route("/about", "./routes/about.tsx"),
    route("/about/doctors", "./routes/about/doctors.tsx"),
    route("/about/facilities", "./routes/about/facilities.tsx"),
    route("/about/equipment", "./routes/about/equipment.tsx"),

    // /centers 그룹 — index + checkup 명시, 그 외는 dynamic $id
    route("/centers", "./routes/centers.tsx"),
    route("/centers/checkup", "./routes/centers/checkup.tsx"),
    route("/centers/:id", "./routes/centers/$id.tsx"),

    // 치료 케이스 아카이브 + 24시 응급
    route("/cases", "./routes/cases.tsx"),
    route("/emergency", "./routes/emergency.tsx"),

    // /support 그룹
    route("/support", "./routes/support.tsx"),
    route("/support/notice", "./routes/support/notice.tsx"),
    route("/support/faq", "./routes/support/faq.tsx"),
    route("/support/contact", "./routes/support/contact.tsx"),

    // legacy paths → redirects (북마크/외부 링크 보호)
    route("/about/greeting", "./routes/about/greeting.tsx"),
    route("/about/info", "./routes/about/info.tsx"),
    route("/about/contact", "./routes/about/contact.tsx"),
    route("/checkup", "./routes/checkup.tsx"),
    // Chrome DevTools Noise Filter
    route("/.well-known/appspecific/com.chrome.devtools.json", "./routes/splinter.tsx"),

    route("/rules", "./routes/rules.tsx"),
    route("/privacy", "./routes/privacy.tsx"),
    route("/email-reject", "./routes/email-reject.tsx"),
    route("/sitemap.xml", "./routes/sitemap.tsx"),

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
