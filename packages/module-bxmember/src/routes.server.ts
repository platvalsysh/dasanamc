import { type RouteConfig, relative } from "@react-router/dev/routes";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { route } = relative(__dirname);

export const routesPublic = [
  route("/bxmember", "public/index/page.tsx"),
  route("/search/alumni", "public/index/page.tsx"),
] satisfies RouteConfig;

export const routesAdmin = [
  route("admin/bxmember/member", "admin/member/list/page.tsx"),
  route("admin/bxmember/setting", "admin/setting/page.tsx"),
  route("admin/api/bxmember/member/excel-download", "admin/api/member/excel-download.ts"),
  route("admin/api/bxmember/member/excel-upload", "admin/api/member/excel-upload.ts"),
  route("admin/bxmember/professor", "admin/professor/list/page.tsx"),
  route("admin/api/bxmember/professor/excel-download", "admin/api/professor/excel-download.ts"),
  route("admin/api/bxmember/professor/excel-upload", "admin/api/professor/excel-upload.ts"),
  route("admin/api/bxmember/professor/all", "admin/api/professor/all.ts"),
  route("admin/bxmember/emeritus", "admin/emeritus/list/page.tsx"),
  route("admin/api/bxmember/emeritus/excel-download", "admin/api/emeritus/excel-download.ts"),
  route("admin/api/bxmember/emeritus/excel-upload", "admin/api/emeritus/excel-upload.ts"),
  route("admin/api/bxmember/emeritus/all", "admin/api/emeritus/all.ts"),
  route("admin/api/bxmember/member/options", "admin/api/member/options.ts"),
  route("admin/api/bxmember/member/preview", "admin/api/member/preview.ts"),
  route("admin/api/bxmember/member/send/sms", "admin/api/member/send-sms.ts"),
  route("admin/api/bxmember/member/send/email", "admin/api/member/send-email.ts"),
  route("admin/api/bxmember/member/kakao/templates", "admin/api/member/kakao-templates.ts"),
  route("admin/api/bxmember/member/kakao/template-detail", "admin/api/member/kakao-template-detail.ts"),
  route("admin/api/bxmember/member/send/kakao", "admin/api/member/send-kakao.ts"),
  route("admin/api/bxmember/member/kakao/file-info", "admin/api/member/kakao-file-info.ts"),
  route("admin/api/bxmember/groups/list", "admin/api/groups/list.ts"),
  route("admin/api/bxmember/groups/members", "admin/api/groups/members.ts"),
  route("admin/api/bxmember/groups/search/member", "admin/api/groups/search/member.ts"),
  route("admin/api/bxmember/groups/search/professor", "admin/api/groups/search/professor.ts"),
  route("admin/api/bxmember/groups/search/executive", "admin/api/groups/search/executive.ts"),
  route("admin/api/bxmember/groups/create", "admin/api/groups/create.ts"),
  route("admin/api/bxmember/groups/update", "admin/api/groups/update.ts"),
  route("admin/api/bxmember/groups/delete", "admin/api/groups/delete.ts"),
  route("admin/api/bxmember/groups/member-add", "admin/api/groups/member-add.ts"),
  route("admin/api/bxmember/groups/member-add-bulk", "admin/api/groups/member-add-bulk.ts"),
  route("admin/api/bxmember/groups/member-add-excel", "admin/api/groups/member-add-excel.ts"),
  route("admin/api/bxmember/groups/member-remove", "admin/api/groups/member-remove.ts"),
  route("admin/api/bxmember/groups/member-remove-bulk", "admin/api/groups/member-remove-bulk.ts"),
  route("admin/api/bxmember/groups/detail", "admin/api/groups/detail.ts"),
  route("admin/bxmember/group", "admin/group/detail/page.tsx"),
] satisfies RouteConfig;
