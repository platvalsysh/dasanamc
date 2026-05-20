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

/**
 * 동적 사이트 메뉴 항목을 모듈이 직접 resolver 함수로 노출.
 *
 * 과거 `query: string` + `$queryRawUnsafe` 방식은 모듈 선언이 임의 SQL
 * 문자열을 들고 있어 보안 audit 에서 critical 로 잡혔다. 이제 모듈은 자체
 * 서비스/Prisma 호출을 통해 parameterized query 로 결과를 만들어 반환한다.
 *
 * 반환 형식은 라벨 + 경로 파라미터 매핑. admin 메뉴 빌더는 이를 받아 unit
 * `path` 의 `:param` 자리를 채워 메뉴 항목을 생성한다.
 */
export interface SiteMenuDynamicConfig {
  resolver: () => Promise<ReadonlyArray<SiteMenuDynamicItem>>;
}

export interface SiteMenuDynamicItem {
  /** 동적 항목의 안정적 식별자. 페이지 키로 사용. */
  id: string;
  /** 표시 라벨. */
  label: string;
  /** unit.path 의 `:paramName` 자리에 채워질 값 dict. */
  params?: Record<string, string>;
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
