import { type RouteConfigEntry } from "@react-router/dev/routes";
import { type deleted_modules } from "@repo/database";

export type ModuleValidPermissionKey<Name> = Name extends string
  ? Name extends "core"
    ? `${Name}.${Lowercase<string>}` | `*`
    : `${Name}.${Lowercase<string>}`
  : never;

export interface Permission<P = string> {
  name: P;
  display_name: string;
  description?: string;
  is_dangerous?: boolean;
}

export interface Role<P = string, Name = string> {
  name: Name;
  display_name: string;
  description?: string;
  permission_names?: P[];
}

/**
 * 모듈이 admin 사이드바에 노출하는 메뉴 항목 단위.
 *
 * 트리(`children`) 와 그룹 메타(`group`, `order`) 를 함께 가질 수 있다.
 * `getAdminMenuTree()` 가 활성 모듈의 항목을 group 으로 묶고 order 로 정렬해
 * `AdminMenuConfigItem` 트리로 합성한다.
 *
 * - `group` 미지정 시 모듈 이름이 그룹이 됨
 * - `order` 미지정 시 100 (그룹 내 순서). 그룹 자체 순서는 group 항목 중 최소 order
 * - `path` 를 비우고 `children` 만 두면 펼침 전용 부모 항목
 */
export interface AdminMenuItemUnit<P = string> {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  permission?: P | P[];
  group?: string;
  order?: number;
  children?: ReadonlyArray<AdminMenuItemUnit<P>>;
}

export interface SiteMenuItemUnit<P = string> {
  id?: string;
  label: string;
  path?: string;
  permission?: P | P[];
  dynamic?: SiteMenuDynamicConfig;
}

export interface ModuleRoutes {
  public?: RouteConfigEntry[];
  admin?: RouteConfigEntry[];
  api?: RouteConfigEntry[];
}

export interface ModuleFunctions {
  delete?: (deletedModule: deleted_modules) => Promise<void>;
}

export interface SiteMenuDynamicConfig {
    // Raw SQL Query is now the standard
    query: string;

    // Common
    labelColumn: string;
    
    // Param Mapping (Path Param -> DB Column)
    // e.g. { "boardName": "mid" }
    params?: Record<string, string>; 
    
    // Legacy support can be removed or kept as optional if needed, 
    // but user asked for raw defaults. I'll remove the prisma specific ones to be clean.
}

export interface Module<Name = string, P = string, R = string> {
  name: Name;

  permissions?: ReadonlyArray<Permission<P>>;
  roles?: ReadonlyArray<Role<Readonly<P>, R>>;
  adminMenuItemUnits?: ReadonlyArray<AdminMenuItemUnit<Readonly<P>>>;
  siteMenuItemUnits?: ReadonlyArray<SiteMenuItemUnit<Readonly<P>>>;

  routes?: ModuleRoutes;
  functions?: ModuleFunctions;
}

export type BaseModule = Module<string, string>;

export type InferPermissionName<T> = T extends Module<any, infer P, any> ? P : never;
export type InferRoleName<T> = T extends Module<any, any, infer R> ? R : never;


export interface AdminMenuConfigItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  children?: AdminMenuConfigItem[];
  permission?: string | string[];
}

export interface SiteMenuConfigItem {
  id: string;
  label: string;
  to?: string;
  target?: "_blank" | "_self";
  children?: SiteMenuConfigItem[];
  permission?: string | string[];
}

// Re-export AdminMenuConfigItem as legacy if needed, or just keep it.

export interface AdminMenuConfig {
  items: AdminMenuConfigItem[];
}
