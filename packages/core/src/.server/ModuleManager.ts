import { type RouteConfigEntry } from "@react-router/dev/routes";
import { type BaseModule, type ModuleRoutes } from "../types";
import { prisma } from "@repo/database";

export class ModuleManager {
  private modules: Map<string, BaseModule> = new Map();

  private _isRegistered = false;
  public isRegistered() {
    return this._isRegistered;
  }
  /**
   * Register a module or a list of modules
   */
  public register(moduleOrModules: BaseModule | BaseModule[]) {
    if (this._isRegistered) {
      console.warn("ModuleManager is already registered. Overwriting.");
    }
    this._isRegistered = true;
    const modules = Array.isArray(moduleOrModules)
      ? moduleOrModules
      : [moduleOrModules];

    for (const module of modules) {
      if (this.modules.has(module.name)) {
        console.warn(
          `Module ${module.name} is already registered. Overwriting.`,
        );
      }
      this.modules.set(module.name, module);
    }
  }

  /**
   * Get all registered modules
   */
  public getModules(): Record<string, BaseModule> {
    return Object.fromEntries(this.modules);
  }

  /**
   * Get a specific module by name
   */
  public getModule(name: string): BaseModule | undefined {
    return this.modules.get(name);
  }

  /**
   * Get aggregated routes by type
   */
  public getRoutes(type: keyof ModuleRoutes): RouteConfigEntry[] {
    return Array.from(this.modules.values()).flatMap(
      (module) => module.routes?.[type] ?? [],
    );
  }

  /**
   * Get aggregated permissions from all modules
   */
  public getPermissions() {
    return Array.from(this.modules.values()).map((module) => {
      return {
        name: module.name,
        permissions: Object.values(module.permissions ?? {}),
      };
    });
  }

  /**
   * Get aggregated admin menu item units from all modules
   */
  public getAdminMenuItemUnits() {
    return Array.from(this.modules.values()).flatMap(
      (m) => m.adminMenuItemUnits ?? [],
    );
  }

  /**
   * Sync permissions and roles with the database
   */
  /**
   * Sync a specific existing module with the database
   */
  public async syncModule(moduleName: string) {
    const module = this.modules.get(moduleName);
    if (!module) {
      throw new Error(`Module ${moduleName} not found`);
    }

    console.log(`Syncing module ${moduleName} with database...`);

    if (module.permissions) {
      for (const permission of module.permissions) {
        await prisma.admin_permissions.upsert({
          where: { name: permission.name },
          update: {
            display_name: permission.display_name,
            description: permission.description,
            category: module.name,
            is_dangerous: permission.is_dangerous,
          },
          create: {
            name: permission.name,
            display_name: permission.display_name,
            description: permission.description,
            category: module.name,
            is_dangerous: permission.is_dangerous,
          },
        });
      }
    }

    if (module.roles) {
      for (const role of module.roles) {
        // 1. Upsert Role
        const dbRole = await prisma.admin_roles.upsert({
          where: { name: role.name },
          update: {
            display_name: role.display_name,
            description: role.description,
          },
          create: {
            name: role.name,
            display_name: role.display_name,
            description: role.description,
            level: 99, // Default level for code-defined roles
          },
        });

        // 2. Sync Role Permissions if defined
        if (role.permission_names && role.permission_names.length > 0) {
          const permissionNames = role.permission_names;
          const permissions = await prisma.admin_permissions.findMany({
            where: { name: { in: permissionNames as unknown as string[] } },
            select: { id: true },
          });

          const permissionIds = permissions.map((p) => p.id);

          // Transaction to update permissions
          await prisma.$transaction(async (tx) => {
            // Delete existing mappings for this role
            // This is desired to ensure the role exactly matches the code definition
            await tx.admin_role_permissions.deleteMany({
              where: { role_id: dbRole.id },
            });

            // Insert new mappings
            if (permissionIds.length > 0) {
              await tx.admin_role_permissions.createMany({
                data: permissionIds.map((pid) => ({
                  role_id: dbRole.id,
                  permission_id: pid,
                })),
                skipDuplicates: true,
              });
            }
          });
        }
      }
    }
  }

  /**
   * Sync permissions and roles with the database
   */
  public async syncWithDatabase() {
    console.log("Syncing modules with database...");
    const modules = Array.from(this.modules.values());

    for (const module of modules) {
      await this.syncModule(module.name);
    }
    console.log("Modules synced with database.");
  }
  /**
   * Check if a role is managed by a module (system role)
   */
  public isSystemRole(roleName: string): boolean {
    for (const module of this.modules.values()) {
      if (module.roles?.some((r) => r.name === roleName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a permission is managed by a module (system permission)
   */
  public isSystemPermission(permissionName: string): boolean {
    for (const module of this.modules.values()) {
      if (module.permissions?.some((p) => p.name === permissionName)) {
        return true;
      }
    }
    return false;
  }
}

export const moduleManager = new ModuleManager();
