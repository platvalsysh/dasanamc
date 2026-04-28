import { type RouteConfigEntry } from "@react-router/dev/routes";
import { type BaseModule, type ModuleRoutes } from "../types";
import { prisma } from "@repo/database";

/**
 * 모든 기능 모듈을 중앙에서 등록·조회하는 싱글톤 매니저.
 *
 * - 앱 부팅 시 `register(modules)` 1회 호출 (`apps/web/app/modules.server.ts`)
 * - 라우트는 `getRoutes("public" | "admin" | "api")` 로 React Router 에 합쳐짐
 * - 권한/역할은 `syncWithDatabase()` 로 DB 와 동기화
 *
 * @example
 * import { moduleManager } from "@repo/core/server";
 * import { module as board } from "@repo/module-board/module";
 *
 * moduleManager.register([board]);
 * const adminRoutes = moduleManager.getRoutes("admin");
 */
export class ModuleManager {
  private modules: Map<string, BaseModule> = new Map();

  private _isRegistered = false;
  public isRegistered() {
    return this._isRegistered;
  }
  /**
   * 모듈 1개 또는 배열을 등록한다. 이미 등록된 상태에서 다시 호출하면 경고 후 덮어쓴다.
   * 보통 앱 부팅 진입점에서 1회만 호출.
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
   * 등록된 모든 모듈을 `{ [name]: module }` 형태로 반환.
   * 관리자 메뉴 빌더 등에서 모듈 메타데이터를 표시할 때 사용.
   */
  public getModules(): Record<string, BaseModule> {
    return Object.fromEntries(this.modules);
  }

  /**
   * 이름으로 특정 모듈 조회. 없으면 `undefined`.
   */
  public getModule(name: string): BaseModule | undefined {
    return this.modules.get(name);
  }

  /**
   * 타입별로 모든 모듈의 라우트를 평탄화하여 반환.
   * `apps/web/app/routes.ts` 에서 React Router 의 `RouteConfig` 에 합치는 용도.
   *
   * @param type - "public" (공개), "admin" (관리자), "api" (JSON API)
   */
  public getRoutes(type: keyof ModuleRoutes): RouteConfigEntry[] {
    return Array.from(this.modules.values()).flatMap(
      (module) => module.routes?.[type] ?? [],
    );
  }

  /**
   * 모든 모듈의 권한을 모듈명별로 그룹화하여 반환.
   * 관리자 메뉴 빌더가 권한 선택 드롭다운 채울 때 사용.
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
   * 모든 모듈이 선언한 관리자 메뉴 항목 유닛을 평탄화하여 반환.
   * 관리자가 메뉴 빌더에서 골라 끼울 수 있는 _후보_ 목록.
   */
  public getAdminMenuItemUnits() {
    return Array.from(this.modules.values()).flatMap(
      (m) => m.adminMenuItemUnits ?? [],
    );
  }

  /**
   * 특정 모듈의 권한/역할을 DB 에 upsert. 역할의 권한 매핑은 코드 정의를 _완전 일치_ 시키므로
   * DB 에만 추가된 매핑은 삭제됨에 주의.
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
   * 등록된 모든 모듈에 대해 `syncModule` 을 순차 실행.
   * 앱 부팅 시 권한/역할 코드 정의를 DB 와 일치시키는 진입점.
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
   * 코드(모듈)에서 정의된 역할인지 (관리자 UI 에서 임의 생성한 역할이 아닌지) 확인.
   * 시스템 역할은 보통 UI 에서 삭제 불가.
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
   * 코드(모듈)에서 정의된 권한인지 확인. 시스템 권한은 UI 에서 삭제 불가.
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
