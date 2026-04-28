import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route } = relative(__dirname);

export const routesPublic = [
    route("/sponsors", "public/index/page.tsx"),
] satisfies RouteConfig;

export const routesAdmin = [
    route("admin/sponsors", "admin/list.tsx"),
    route("admin/sponsors/new", "admin/new.tsx"),
    route("admin/sponsors/:id", "admin/edit.tsx"),
] satisfies RouteConfig;
