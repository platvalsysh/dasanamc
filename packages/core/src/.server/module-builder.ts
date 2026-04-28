
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


export function createModule<Name extends string>(name: Name): ModuleBuilder<Name> {
  return new ModuleBuilder(name);
}
