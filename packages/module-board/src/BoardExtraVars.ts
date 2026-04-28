import { z } from "zod";

export type BoardPermissionType = "all" | "member" | "admin" | "group";

export interface BoardPermissionConfig {
  type: BoardPermissionType;
  roles?: string[]; // admin_roles.id or name
}

export interface BoardPermissionsShape {
  access: BoardPermissionConfig;
  list: BoardPermissionConfig;
  read: BoardPermissionConfig;
  write: BoardPermissionConfig;
  comment: BoardPermissionConfig;
  manage: BoardPermissionConfig;
}

export type BoardPermissionsBoolean = {
  [K in keyof BoardPermissionsShape]: boolean;
};


export interface BoardExtraVarsShape {
  skin: string;
  description: string;
  use_comment: boolean;
  use_notice: boolean;
  use_secret: boolean;
  use_document_upload: boolean;
  permissions: BoardPermissionsShape;
  list_display: string[];
  read_display: string[];
  page_count_pc: number;
  page_count_mobile: number;
  list_count: number;
}

const DEFAULT_PERMISSION: BoardPermissionConfig = { type: "all" };
const DEFAULT_ADMIN_PERMISSION: BoardPermissionConfig = { type: "admin" };
const DEFAULT_MEMBER_PERMISSION: BoardPermissionConfig = { type: "member" };

const DEFAULT_PERMISSIONS: BoardPermissionsShape = {
  access: DEFAULT_PERMISSION,
  list: DEFAULT_PERMISSION,
  read: DEFAULT_PERMISSION,
  write: DEFAULT_MEMBER_PERMISSION,
  comment: DEFAULT_MEMBER_PERMISSION,
  manage: DEFAULT_ADMIN_PERMISSION,
};

const DEFAULT_BOARD_EXTRA_VARS: BoardExtraVarsShape = {
  skin: "general",
  description: "",
  use_comment: true,
  use_notice: true,
  use_secret: false,
  use_document_upload: true,
  permissions: DEFAULT_PERMISSIONS,
  list_display: ["id", "title", "user", "created_at", "view_count"],
  read_display: ["author", "created_at", "view_count", "file_list"],
  page_count_pc: 9,
  page_count_mobile: 5,
  list_count: 20,
};

const BooleanStringSchema = z.union([
  z.boolean(),
  z.string().transform((val) => val === "Y" || val === "true"),
]);

const PermissionTypeSchema = z.enum(["all", "member", "admin", "group"]);

const PermissionConfigSchema = z.object({
  type: PermissionTypeSchema,
  roles: z.array(z.string()).optional(),
});

const BoardPermissionsSchema = z.object({
  access: PermissionConfigSchema.default(DEFAULT_PERMISSION),
  list: PermissionConfigSchema.default(DEFAULT_PERMISSION),
  read: PermissionConfigSchema.default(DEFAULT_PERMISSION),
  write: PermissionConfigSchema.default(DEFAULT_MEMBER_PERMISSION),
  comment: PermissionConfigSchema.default(DEFAULT_MEMBER_PERMISSION),
  manage: PermissionConfigSchema.default(DEFAULT_ADMIN_PERMISSION),
});

const BoardExtraVarsSchema = z.object({
  skin: z.string().default("general"),
  description: z.string().default(""),
  use_comment: BooleanStringSchema.default(true),
  use_notice: BooleanStringSchema.default(true),
  use_secret: BooleanStringSchema.default(false),
  use_document_upload: BooleanStringSchema.default(true),
  permissions: BoardPermissionsSchema.default(DEFAULT_PERMISSIONS),
  list_display: z.array(z.string()).default(["id", "title", "user", "created_at", "view_count"]),
  read_display: z.array(z.string()).default(["author", "created_at", "view_count", "file_list"]),
  page_count_pc: z.number().default(9),
  page_count_mobile: z.number().default(5),
  list_count: z.number().default(20),
});

export class BoardExtraVars implements BoardExtraVarsShape {
  public skin: string;
  public description: string;
  public use_comment: boolean;
  public use_notice: boolean;
  public use_secret: boolean;
  public use_document_upload: boolean;
  public permissions: BoardPermissionsShape;
  public list_display: string[];
  public read_display: string[];
  public page_count_pc: number;
  public page_count_mobile: number;
  public list_count: number;

  constructor(extra_vars?: Partial<BoardExtraVarsShape>) {
    const merged: BoardExtraVarsShape = {
      ...DEFAULT_BOARD_EXTRA_VARS,
      ...extra_vars,
    };

    // Deep merge for permissions to ensure partial updates don't wipe defaults
    const permissions = {
      ...DEFAULT_BOARD_EXTRA_VARS.permissions,
      ...(extra_vars?.permissions || {}),
    };

    this.skin = merged.skin;
    this.description = merged.description;
    this.use_comment = merged.use_comment;
    this.use_notice = merged.use_notice;
    this.use_secret = merged.use_secret;
    this.use_document_upload = merged.use_document_upload;
    this.permissions = permissions;
    this.list_display = merged.list_display;
    this.read_display = merged.read_display;
    this.page_count_pc = merged.page_count_pc;
    this.page_count_mobile = merged.page_count_mobile;
    this.list_count = merged.list_count;
  }

  static fromJson(value: any) {
    let parsed: any = {};
    try {
      const json = typeof value === "string" ? JSON.parse(value) : value;
      const result = BoardExtraVarsSchema.safeParse(json);
      if (result.success) {
        parsed = result.data;
      }
    } catch (e) {
      // Parsing error
    }
    return new BoardExtraVars(parsed);
  }

  toJSON(): BoardExtraVarsShape {
    return {
      skin: this.skin,
      description: this.description,
      use_comment: this.use_comment,
      use_notice: this.use_notice,
      use_secret: this.use_secret,
      use_document_upload: this.use_document_upload,
      permissions: this.permissions,
      list_display: this.list_display,
      read_display: this.read_display,
      page_count_pc: this.page_count_pc,
      page_count_mobile: this.page_count_mobile,
      list_count: this.list_count,
    };
  }
}
