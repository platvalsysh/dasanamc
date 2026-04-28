import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route } = relative(__dirname);

export const routesPublic = [
  route("/auth", "./public/index/page.tsx"),
  route("/auth/sign-up", "./public/sign-up/page.tsx"),
  route("/auth/login", "./public/login/page.tsx"),
  route("/auth/logout", "./public/logout/page.tsx"),
  route("/auth/confirm", "./public/confirm/page.tsx"),
  route("/auth/error", "./public/error/page.tsx"),
  route("/auth/forgot-password", "./public/forgot-password/page.tsx"),
  route("/auth/update-password", "./public/update-password/page.tsx"),
  route("/auth/mypage", "./public/mypage/page.tsx"),
] satisfies RouteConfig;

export const routesAdmin = [
  route("/admin/auth", "./admin/index/page.tsx"),
  route("/admin/users", "./admin/users/page.tsx"),
  route("/admin/users/roles", "./admin/roles/page.tsx"),
  route("/admin/users/assign-roles", "./admin/assign-roles/page.tsx"),
] satisfies RouteConfig;
