import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route } = relative(__dirname);

export const routesPublic = [
    route("newsletters", "public/list.tsx"),
    route("newsletters/:id/view", "public/view.tsx"),
    route("api/newsletter/widget/latest", "api/widget.tsx"),
] satisfies RouteConfig;

export const routesAdmin = [
    route("admin/newsletters", "admin/list.tsx"),
    route("admin/newsletters/new", "admin/new.tsx"),
    route("admin/newsletters/:id", "admin/new.tsx"),
] satisfies RouteConfig;

