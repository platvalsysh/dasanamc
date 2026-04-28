import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route } = relative(__dirname);

export const routesPublic = [
    route("schedules", "public/list.tsx"),
    route("schedules/download.ics", "public/download.ts"),
] satisfies RouteConfig;

export const routesAdmin = [
    route("admin/schedules", "admin/list.tsx"),
    route("admin/schedules/new", "admin/new.tsx"),
    route("admin/schedules/:id", "admin/new.tsx"),
] satisfies RouteConfig;
