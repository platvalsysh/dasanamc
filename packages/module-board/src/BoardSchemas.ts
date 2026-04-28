import { z } from "zod";

// Shared Params Schemas
export const BoardParamsSchema = z.object({
  boardName: z.string(),
});

export const BoardDocumentParamsSchema = z.object({
  boardName: z.string(),
  id: z.string().uuid(),
});

// Search Params Schemas
export const BoardListSearchSchema = z.object({
  page: z.coerce.number().default(1),
  search_target: z.string().default("title_content"),
  search_keyword: z.string().optional(),
  category_id: z.string().optional().nullable(),
});

export const BoardReadSearchSchema = z.object({
  cpage: z.coerce.number().default(1),
});

// Write/Edit Schema
export const BoardWriteSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(1, { message: "제목을 입력해주세요." }),
  content: z
    .string()
    .min(1, { message: "내용을 입력해주세요." }),
  thumbnail: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),
  category_id: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),
  is_notice: z.string().optional().transform(v => v === "true"),
  is_secret: z.string().optional().transform(v => v === "true"),
  allow_comment: z.string().optional().transform(v => v === "true"),
  is_temp: z.string().optional().transform(v => v === "true"),
});

export type BoardWriteInput = z.infer<typeof BoardWriteSchema>;

// Comment Action Schemas
export const BoardCommentCreateSchema = z.object({
  content: z.string().min(1),
  parent_id: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),
});

export const BoardCommentDeleteSchema = z.object({
  comment_id: z.string().uuid(),
});

export const BoardCommentVoteSchema = z.object({
  comment_id: z.string().uuid(),
});

// Admin Schemas
export const BoardAdminModuleSchema = z.object({
  mid: z.string().min(1, { message: "게시판 ID는 필수입니다." }).regex(/^[A-Za-z][A-Za-z0-9]*$/, { message: "영문자로 시작해야 하며 영문자와 숫자만 사용 가능합니다." }),
  browser_title: z.string().optional(),
  skin: z.string().default("general"),
  description: z.string().optional(),
  use_comment: z.string().optional().transform(v => v === "on"),
  use_notice: z.string().optional().transform(v => v === "on"),
  use_secret: z.string().optional().transform(v => v === "on"),
  use_document_upload: z.string().optional().transform(v => v === "on"),
  permissions: z.string().optional().transform(v => v ? JSON.parse(v) : undefined),
  list_display: z.string().optional().transform(v => v ? JSON.parse(v) : undefined),
  read_display: z.string().optional().transform(v => v ? JSON.parse(v) : undefined),
  page_count_pc: z.coerce.number().default(9),
  page_count_mobile: z.coerce.number().default(5),
  list_count: z.coerce.number().default(20),
});

export const BoardAdminPermissionUpdateSchema = z.object({
  permissions: z.string().min(1, { message: "Permission data missing" }).transform(v => JSON.parse(v)),
});

export type BoardAdminModuleInput = z.infer<typeof BoardAdminModuleSchema>;
