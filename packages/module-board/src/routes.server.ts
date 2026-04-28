import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route, layout } = relative(__dirname);

export const routesPublic = [
  route("/board/:boardName", "./public/list.tsx"),
  route("/board/:boardName/write", "./public/write.tsx"),
  route("/board/:boardName/:id/edit", "./public/edit.tsx"),
  route("/board/:boardName/:id/delete", "./public/delete.tsx"),
  route("/board/:boardName/:id", "./public/read.tsx"),
  // API Routes
  route("api/board/widget/latest", "./api/widget.tsx"),
] satisfies RouteConfig;

export const routesAdmin = [
  layout("admin/layout.tsx", [
    route("admin/board", "admin/page.tsx"),
    route("admin/board/new", "admin/new.tsx"),
    route("admin/board/:id", "admin/edit.tsx"),
    route("admin/board/:id/category", "admin/category.tsx"),
    route("admin/board/:id/delete", "admin/delete.tsx"),
    route("admin/board/:id/templates", "admin/templates/list.tsx"),
    route("admin/board/:id/templates/new", "admin/templates/edit.tsx"),
    route("admin/board/:id/templates/:templateId", "admin/templates/edit.tsx"),
  ]),
] satisfies RouteConfig;
