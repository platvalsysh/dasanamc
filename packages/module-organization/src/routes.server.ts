import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route } = relative(__dirname);

export const routesPublic = [
    // Public route placeholder
    route("organization", "public/organization.tsx"),
] satisfies RouteConfig;

export const routesAdmin = [
    route("admin/organization", "admin/organization.tsx"),
    route("admin/api/organization/send-sms", "admin/api/send-sms.ts"),
] satisfies RouteConfig;
