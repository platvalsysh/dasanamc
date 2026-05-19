import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesApi, routesAdmin } from "./routes.server";

export const module = createModule("file")
  .routes({
    api: routesApi,
    admin: routesAdmin,
  })
  .permissions([
    {
      name: "file.*",
      display_name: "All Permissions",
      description: "All permissions for file module",
      is_dangerous: true,
    },
    {
      name: "file.admin.upload",
      display_name: "Upload Files (Admin)",
      description: "Ability to upload files",
    },
    {
      name: "file.admin.read",
      display_name: "Read Files (Admin)",
      description: "Ability to view and list files",
    },
    {
      name: "file.admin.delete",
      display_name: "Delete Files (Admin)",
      description: "Ability to delete files",
      is_dangerous: true,
    },
    {
      name: "file.admin.download",
      display_name: "Download Files (Admin)",
      description: "Ability to download files",
    },
  ])
  .adminMenuItemUnits([
    {
      id: "files-admin-list",
      label: "파일 관리",
      icon: "FolderOpen",
      path: "/admin/files",
      permission: "file.admin.read",
      group: "콘텐츠",
      order: 20,
    },
  ])
  .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;
export { FileService } from "./.server/FileService";

