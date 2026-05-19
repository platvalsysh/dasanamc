import { createModule } from "@repo/core/server";
import { type InferPermissionName, type InferRoleName } from "@repo/core/types";
import { routesAdmin, routesPublic } from "./routes.server";

import { prisma } from "@repo/database";
import { FileService } from "@repo/module-file/server";

export const module = createModule("board")
  .routes({
    public: routesPublic,
    admin: routesAdmin,
  })
  .permissions([
    {
      name: "board.*",
      display_name: "모든 권한",
      description: "모든 권한",
      is_dangerous: true,
    },
    {
      name: "board.list",
      display_name: "게시판 목록 조회",
      description: "게시판 목록을 조회할 수 있음",
    },
    {
      name: "board.view",
      display_name: "게시글 조회",
      description: "게시글을 조회할 수 있음",
    },
    {
      name: "board.create",
      display_name: "게시글 작성",
      description: "새 게시글을 작성할 수 있음",
    },
    {
      name: "board.edit",
      display_name: "게시글 수정",
      description: "게시글을 수정할 수 있음",
    },
    {
      name: "board.delete",
      display_name: "게시글 삭제",
      description: "게시글을 삭제할 수 있음",
      is_dangerous: true,
    },
    {
      name: "board.admin.manage",
      display_name: "게시판 관리",
      description: "게시판을 생성하고 관리할 수 있음",
      is_dangerous: true,
    },
  ])
  .adminMenuItemUnits([
    {
      id: "board-admin",
      label: "게시판 관리",
      icon: "MessageSquare",
      path: "/admin/board",
      permission: "board.admin.manage",
      group: "콘텐츠",
      order: 10,
    },
  ])
  .siteMenuItemUnits([
    {
      label: "게시판",
      path: "/board/:boardName",
      permission: "board.view",
      dynamic: {
          query: "SELECT mid, browser_title FROM core.modules WHERE module = 'board'",
          labelColumn: "browser_title",
          params: {
              "boardName": "mid"
          }
      }
    },
    // {
    //   label: "게시판카테고리",
    //   path: "/board/:boardId/category/:categoryId",
    //   dynamic: {
    //     // 게시판(modules)과 카테고리(categories)를 조인하여 유효한 조합만 가져옴
    //     query: `
    //       SELECT m.mid, c.id as category_id, CONCAT(m.browser_title, ' - ', c.name) as browser_title 
    //       FROM core.modules m
    //       JOIN modules.document_categories c ON c.module_id = m.id
    //       WHERE m.module = 'board'
    //     `,
    //     // 라벨을 "게시판이름 - 카테고리이름" 처럼 만들고 싶다면 SQL에서 CONCAT 사용 추천
    //     labelColumn: "browser_title", 
    //     params: {
    //       "boardId": "mid",          // :boardId -> m.mid 값이 들어감
    //       "categoryId": "category_id" // :categoryId -> c.category_id 값이 들어감
    //     }
    //   }
    // }
  ])
  .functions({
    delete: async (deletedModule) => {
      const moduleId = deletedModule.module_id;
      console.log(`Deleting resources for module ${moduleId}`);
      // 1. Delete all attached files (S3 and DB)
      await FileService.deleteFilesByModuleId(moduleId);

      // 2. Delete all documents (This will cascade to comments if configured in DB, but safe to explicit)
      // Note: DB cascade on 'modules' delete might have already removed documents.
      // But if this runs asynchronously or if we want to be sure:
      await prisma.documents.deleteMany({
        where: { module_id: moduleId },
      });

      console.log(`Resources deleted for module ${moduleId}`);
    },
  })
  .build();

export type PermissionName = InferPermissionName<typeof module>;
export type RoleName = InferRoleName<typeof module>;

