import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route } = relative(__dirname);

export const routesApi = [
  route("/api/file/upload-url", "./api/upload-url.ts"),
  route("/api/file/mark-uploaded", "./api/mark-uploaded.ts"),
  route("/api/file/list", "./api/list.ts"),
  route("/api/file/delete", "./api/delete.ts"),
  route("/api/file/:fileId/download", "./api/download.ts"),
  route("/api/file/:fileId/thumbnail", "./api/thumbnail.ts"),
  route("/api/file/publish", "./api/publish.ts"),
] satisfies RouteConfig;

export const routesAdmin = [
  route("/admin/files", "./admin/files/list.tsx"),
] satisfies RouteConfig;
