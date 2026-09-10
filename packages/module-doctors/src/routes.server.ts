import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route } = relative(__dirname);

// 공개 페이지는 apps/web 의 /about/doctors, /centers/:id 가 담당 (모듈 라우트 없음)
export const routesPublic = [] satisfies RouteConfig;

export const routesAdmin = [
  route("/admin/doctors", "admin/list.tsx"),
  route("/admin/doctors/new", "admin/new.tsx"),
  route("/admin/doctors/:id/edit", "admin/edit.tsx"),
  route("/admin/doctors/:id/delete", "admin/delete.ts"),
] satisfies RouteConfig;

export const routesApi = [] satisfies RouteConfig;
