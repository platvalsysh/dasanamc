import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";

import { routesAdmin, routesPublic } from "./routes.server";

export const module = createModule("bxmember")
  .routes({
    public: routesPublic,
    admin: routesAdmin,
  })
  .permissions([
    {
      name: "bxmember.*",
      display_name: "모든 권한",
      description: "모든 권한을 가짐",
      is_dangerous: true,
    },
    {
      name: "bxmember.list",
      display_name: "동문 목록 조회",
      description: "동문 목록을 조회할 수 있음",
    },
    {
      name: "bxmember.view",
      display_name: "동문 조회",
      description: "동문 정보를 조회할 수 있음",
    },
    {
      name: "bxmember.create",
      display_name: "동문 생성",
      description: "새 동문을 생성할 수 있음",
    },
    {
      name: "bxmember.edit",
      display_name: "동문 수정",
      description: "동문 정보를 수정할 수 있음",
    },
    {
      name: "bxmember.delete",
      display_name: "동문 삭제",
      description: "동문을 삭제할 수 있음",
      is_dangerous: true,
    },
    {
      name: "bxmember.excel.download",
      display_name: "엑셀 다운로드",
      description: "동문 목록을 엑셀로 다운로드할 수 있음",
    },
    {
      name: "bxmember.excel.upload",
      display_name: "엑셀 업로드",
      description: "엑셀 파일을 통해 동문을 일괄 등록/수정할 수 있음",
      is_dangerous: true,
    },
    {
      name: "bxmember.professor.list",
      display_name: "교수진 목록 조회",
      description: "교수진 목록을 조회할 수 있음",
    },
    {
      name: "bxmember.professor.create",
      display_name: "교수진 생성",
      description: "새 교수를 생성할 수 있음",
    },
     {
      name: "bxmember.professor.edit",
      display_name: "교수진 수정",
      description: "교수 정보를 수정할 수 있음",
    },
    {
      name: "bxmember.professor.delete",
      display_name: "교수진 삭제",
      description: "교수를 삭제할 수 있음",
      is_dangerous: true,
    },
    {
      name: "bxmember.professor.excel.download",
      display_name: "교수진 엑셀 다운로드",
      description: "교수진 목록을 엑셀로 다운로드할 수 있음",
    },
    {
      name: "bxmember.professor.excel.upload",
      display_name: "교수진 엑셀 업로드",
      description: "엑셀 파일을 통해 교수진을 일괄 등록/수정할 수 있음",
      is_dangerous: true,
    },
    {
      name: "bxmember.emeritus.list",
      display_name: "명예교수진 목록 조회",
      description: "명예교수진 목록을 조회할 수 있음",
    },
    {
      name: "bxmember.emeritus.create",
      display_name: "명예교수진 생성",
      description: "새 명예교수를 생성할 수 있음",
    },
    {
      name: "bxmember.emeritus.edit",
      display_name: "명예교수진 수정",
      description: "명예교수 정보를 수정할 수 있음",
    },
    {
      name: "bxmember.emeritus.delete",
      display_name: "명예교수진 삭제",
      description: "명예교수를 삭제할 수 있음",
      is_dangerous: true,
    },
    {
      name: "bxmember.emeritus.excel.download",
      display_name: "명예교수진 엑셀 다운로드",
      description: "명예교수진 목록을 엑셀로 다운로드할 수 있음",
    },
    {
      name: "bxmember.emeritus.excel.upload",
      display_name: "명예교수진 엑셀 업로드",
      description: "엑셀 파일을 통해 명예교수진을 일괄 등록/수정할 수 있음",
      is_dangerous: true,
    },
    {
      name: "bxmember.group.list",
      display_name: "그룹 목록 조회",
      description: "그룹 목록을 조회할 수 있음",
    },
    {
      name: "bxmember.group.create",
      display_name: "그룹 생성",
      description: "새 그룹을 생성할 수 있음",
    },
    {
      name: "bxmember.group.edit",
      display_name: "그룹 수정",
      description: "그룹 정보를 수정할 수 있음",
    },
    {
      name: "bxmember.group.delete",
      display_name: "그룹 삭제",
      description: "그룹을 삭제할 수 있음",
    },
  ]).adminMenuItemUnits([
    {
      id: "bxmember-list",
      label: "동문관리",
      icon: "Users",
      path: "/admin/bxmember/member",
      permission: "bxmember.list",
    },
    {
      id: "bxprofessor-list",
      label: "학부교수님",
      icon: "GraduationCap",
      path: "/admin/bxmember/professor",
      permission: "bxmember.professor.list",
    },
    {
      id: "bxemeritus-list",
      label: "명예교수님",
      icon: "Award",
      path: "/admin/bxmember/emeritus",
      permission: "bxmember.emeritus.list",
    },
    {
      id: "bxmember-setting",
      label: "설정",
      icon: "Settings",
      path: "/admin/bxmember/setting",
      permission: "bxmember.*",
    },
    {
      id: "bxmember-group",
      label: "그룹 관리",
      icon: "Users",
      path: "/admin/bxmember/group",
      permission: "bxmember.group.list",
    }
  ])
  .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;

