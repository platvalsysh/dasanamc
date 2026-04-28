import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route } = relative(__dirname);

export const routesPublic = [
  route("/example", "public/index/page.tsx"),
] satisfies RouteConfig;

export const routesAdmin = [
  route("/admin/example", "admin/index/page.tsx"),
  route("/admin/example/list", "admin/list/page.tsx"),
  route("/admin/example/create", "admin/create/page.tsx"),
] satisfies RouteConfig;

export const routesApi = [
  route("/api/example/list", "api/list.ts"),
  route("/api/example/create", "api/create.ts"),
  route("/api/example/:id", "api/view.ts"),
  route("/api/example/:id/edit", "api/edit.ts"),
  route("/api/example/:id/delete", "api/delete.ts"),

  route("/api/admin/example/list", "api/admin/list.ts"),
  route("/api/admin/example/create", "api/admin/create.ts"),
  route("/api/admin/example/:id", "api/admin/view.ts"),
  route("/api/admin/example/:id/edit", "api/admin/edit.ts"),
  route("/api/admin/example/:id/delete", "api/admin/delete.ts"),
] satisfies RouteConfig;
