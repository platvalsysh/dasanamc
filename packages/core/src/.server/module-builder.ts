
import type { 
  Module, 
  Permission, 
  Role, 
  AdminMenuItemUnit, 
  ModuleValidPermissionKey,
  ModuleRoutes,
  ModuleFunctions,
  SiteMenuItemUnit
} from "../types";

/**
 * 모듈 정의용 fluent builder. 각 메서드는 `this` 를 반환하므로 체이닝 가능.
 *
 * 권한 이름은 타입으로 강제: `${name}.${소문자}` ("core" 모듈만 `*` 와일드카드).
 *
 * 직접 사용하지 말고 {@link createModule} 헬퍼 사용 권장.
 */
export class ModuleBuilder<Name extends string, P extends string = never, R extends string = never> {
  private _module: Partial<Module<Name, P, R>> & { name: Name };

  constructor(name: Name) {
    this._module = { name };
  }

  permissions<const NewP extends ModuleValidPermissionKey<Name>>(
    permissions: readonly ({ name: NewP } & Permission<NewP>)[]
  ): ModuleBuilder<Name, NewP, R> {
    this._module.permissions = permissions as any;
    return this as unknown as ModuleBuilder<Name, NewP, R>;
  }

  roles<const NewR extends string>(
    roles: readonly ({ name: NewR } & Role<P, NewR>)[]
  ): ModuleBuilder<Name, P, NewR> {
    this._module.roles = roles as any;
    return this as unknown as ModuleBuilder<Name, P, NewR>;
  }

  adminMenuItemUnits(
    items: readonly AdminMenuItemUnit<P>[]
  ): this {
    this._module.adminMenuItemUnits = items;
    return this;
  }

  siteMenuItemUnits(
    items: readonly SiteMenuItemUnit<P>[]
  ): this {
    this._module.siteMenuItemUnits = items;
    return this;
  }

  routes(routes: ModuleRoutes): this {
    this._module.routes = routes;
    return this;
  }

  functions(functions: ModuleFunctions): this {
    this._module.functions = functions;
    return this;
  }

  build(): Module<Name, P, R> {
    return this._module as Module<Name, P, R>;
  }
}


/**
 * 새 모듈을 정의한다. 결과는 `apps/web/app/modules.server.ts` 의
 * `modules` 배열에 넣어 `moduleManager.register()` 에 전달한다.
 *
 * @example
 * export const module = createModule("blog")
 *   .routes({ public: routesPublic, admin: routesAdmin, api: routesApi })
 *   .permissions([
 *     { name: "blog.list", display_name: "목록 조회" },
 *     { name: "blog.delete", display_name: "삭제", is_dangerous: true },
 *   ])
 *   .roles([
 *     { name: "ROLE_BLOG_EDITOR", display_name: "Editor", permission_names: ["blog.list"] },
 *   ])
 *   .adminMenuItemUnits([
 *     { id: "blog-list", label: "Blog", icon: "newspaper", path: "/admin/blog", permission: "blog.list" },
 *   ])
 *   .build();
 */
export function createModule<Name extends string>(name: Name): ModuleBuilder<Name> {
  return new ModuleBuilder(name);
}
