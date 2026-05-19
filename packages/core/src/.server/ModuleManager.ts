import { type RouteConfigEntry } from "@react-router/dev/routes";
import {
  type AdminMenuConfigItem,
  type AdminMenuItemUnit,
  type BaseModule,
  type ModuleRoutes,
} from "../types";
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
   * (트리 형태가 아닌 단순 유닛 목록)
   */
  public getAdminMenuItemUnits() {
    return Array.from(this.modules.values()).flatMap(
      (m) => m.adminMenuItemUnits ?? [],
    );
  }

  /**
   * 활성 모듈의 `adminMenuItemUnits` 를 group 으로 묶고 order 로 정렬해서
   * admin 사이드바에 그대로 렌더링할 수 있는 `AdminMenuConfigItem[]` 트리를 만든다.
   *
   * 규칙:
   * - 단위(`AdminMenuItemUnit`)에 `group` 미지정 → 모듈 이름이 그룹
   * - 단위에 `order` 미지정 → 100 (그룹 내 순서)
   * - 그룹 자체 순서 → 그 그룹 멤버의 최소 order
   * - 같은 group 이름을 가진 단위는 같은 부모 메뉴에 children 으로 묶임
   * - 단위가 `children` 을 갖고 있으면 그 children 도 재귀적으로 포함
   *
   * 비활성 모듈(ENABLED_MODULES 화이트리스트 밖)은 register 되지 않으므로
   * 자동으로 트리에서 빠짐.
   */
  public getAdminMenuTree(): AdminMenuConfigItem[] {
    interface GroupBucket {
      label: string;
      order: number;
      items: AdminMenuItemUnit[];
    }
    const buckets = new Map<string, GroupBucket>();

    for (const module of this.modules.values()) {
      const units = module.adminMenuItemUnits;
      if (!units || units.length === 0) continue;

      for (const unit of units) {
        const groupName = unit.group ?? module.name;
        const order = unit.order ?? 100;
        const bucket = buckets.get(groupName) ?? {
          label: groupName,
          order,
          items: [],
        };
        bucket.order = Math.min(bucket.order, order);
        bucket.items.push(unit);
        buckets.set(groupName, bucket);
      }
    }

    const toConfigItem = (
      unit: AdminMenuItemUnit,
      idPrefix: string,
    ): AdminMenuConfigItem => {
      const id = unit.id || `${idPrefix}-${unit.label}`;
      const item: AdminMenuConfigItem = {
        id,
        label: unit.label,
        icon: unit.icon ?? "Square",
        path: unit.path,
        permission: unit.permission,
      };
      if (unit.children && unit.children.length > 0) {
        item.children = [...unit.children]
          .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
          .map((c) => toConfigItem(c, id));
      }
      return item;
    };

    const result: AdminMenuConfigItem[] = [];
    const sortedBuckets = Array.from(buckets.entries()).sort(
      (a, b) => a[1].order - b[1].order,
    );

    for (const [groupName, bucket] of sortedBuckets) {
      const items = [...bucket.items].sort(
        (a, b) => (a.order ?? 100) - (b.order ?? 100),
      );

      // 그룹 멤버가 1개이고 그룹 이름이 모듈 이름(즉 명시적 group 미설정)이면
      // 평면화: 부모 카드 없이 단일 항목으로 노출
      if (
        items.length === 1 &&
        items[0].group === undefined &&
        !items[0].children
      ) {
        result.push(toConfigItem(items[0], groupName));
        continue;
      }

      // 그룹 부모 항목 + 자식들
      const groupItem: AdminMenuConfigItem = {
        id: `group-${groupName}`,
        label: bucket.label,
        icon: "FolderOpen",
        children: items.map((u) => toConfigItem(u, groupName)),
      };
      result.push(groupItem);
    }

    return result;
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
   * 등록된 모든 모듈에 대해 `syncModule` 을 순차 실행 + 코드에 더 이상 없는 권한을
   * `deactivated_at = now()` 로 마킹. 활성 모듈이 다시 선언하는 권한은
   * `deactivated_at = NULL` 로 복구.
   *
   * 앱 부팅 + `pnpm --filter web db:init-permissions` 의 단일 진입점.
   * 역할 매핑 (`admin_user_roles`) 은 권한 행을 보존하므로 끊기지 않음.
   */
  public async syncWithDatabase() {
    console.log("Syncing modules with database...");
    const modules = Array.from(this.modules.values());

    // 1. 활성 모듈 권한 upsert + 역할 매핑
    for (const module of modules) {
      await this.syncModule(module.name);
    }

    // 2. 코드 정의 권한 set
    const activeNames = new Set<string>();
    for (const module of modules) {
      for (const permission of module.permissions ?? []) {
        activeNames.add(permission.name);
      }
    }

    // 3. 활성 set 에 포함되면 deactivated_at = NULL 로 복구 (cold restart 안전망)
    if (activeNames.size > 0) {
      await prisma.admin_permissions.updateMany({
        where: {
          name: { in: Array.from(activeNames) },
          deactivated_at: { not: null },
        },
        data: { deactivated_at: null },
      });
    }

    // 4. 활성 set 밖이고 아직 deactivated 되지 않은 권한은 deactivate
    const deactivated = await prisma.admin_permissions.updateMany({
      where: {
        name: { notIn: Array.from(activeNames) },
        deactivated_at: null,
      },
      data: { deactivated_at: new Date() },
    });
    if (deactivated.count > 0) {
      console.log(
        `Deactivated ${deactivated.count} permission(s) no longer declared by any active module.`,
      );
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
