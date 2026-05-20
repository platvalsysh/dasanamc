import type { RouterContextProvider } from "react-router";
import { createContext } from "react-router";
import type { User } from "../types/auth";
import { prisma } from "@repo/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checkUserPermissions } from "../utils/permission-check";

// Global cache for role -> permissions mapping
let rolePermissionsCache: Record<string, string[]> | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL_MS = 2000; // 2 second

async function getRolePermissionsMap(): Promise<Record<string, string[]>> {
  const now = Date.now();
  if (rolePermissionsCache && now - lastCacheUpdate < CACHE_TTL_MS) {
    return rolePermissionsCache;
  }

  try {
    // Fetch all roles and their permissions
    const result = await prisma.$queryRaw`
      SELECT
        r.name as role_name,
        p.name as permission_name
      FROM
        "core"."admin_roles" r
      JOIN
        "core"."admin_role_permissions" rp ON r.id = rp.role_id
      JOIN
        "core"."admin_permissions" p ON rp.permission_id = p.id
    `;

    const newCache: Record<string, string[]> = {};

    (result as any[]).forEach((row: any) => {
      const roleName = row.role_name;
      const permissionName = row.permission_name;

      if (!newCache[roleName]) {
        newCache[roleName] = [];
      }
      if (!newCache[roleName].includes(permissionName)) {
        newCache[roleName].push(permissionName);
      }
    });

    rolePermissionsCache = newCache;
    lastCacheUpdate = now;
    return newCache;
  } catch (e) {
    console.error("Failed to refresh role permissions cache", e);
    // Return existing cache if available, even if stale, otherwise empty
    return rolePermissionsCache || {};
  }
}

export class Auth {
  constructor(
    private user: User | null = null,
    private permissions: string[] = [],
    private roles: string[] = [],
  ) {}

  isLogged() {
    return !!this.user;
  }

  static async makeBySupabase(request: Request, supabase: SupabaseClient) {
    // const { data } = await supabase.auth.getUser();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    // console.log(claims);
    if (!claims) {
      return new Auth();
    }

    const user: User = {
      id: claims.sub,
      email: claims.email,
      display_name: claims.display_name ?? "",
      profile_image: claims.profile_image ?? undefined,
    };

    const roles: string[] = Array.isArray(claims.roles) ? claims.roles : [];

    // Get permissions from cache based on roles
    const rolePermissionsMap = await getRolePermissionsMap();

    const finalPermissions = [
      ...new Set(roles.flatMap((r) => rolePermissionsMap[r] || [])),
    ] as string[];

    return new Auth(user, finalPermissions, roles);
  }

  getUser() {
    return this.user;
  }

  getPermissions() {
    return this.permissions;
  }

  getRoles() {
    return this.roles;
  }

  getAuthReactContextData() {
    return {
      user: this.user,
      permissions: this.permissions,
      roles: this.roles,
    };
  }



  checkPermissions(permission: string[], requireAll: boolean = false): boolean {
    if (!this.user) {
      return false;
    }

    return checkUserPermissions(
      permission,
      this.permissions,
      this.roles,
      requireAll,
    );
  }

  /**
   * 권한 가드. action / loader 첫 줄에서 호출. 미충족 시 즉시 Response 던져
   * React Router 가 그대로 응답으로 사용. 로그인 필요 시 401, 권한 부족 시 403.
   *
   * - 로그인 안 한 사용자에게는 401 + WWW-Authenticate (action) 또는 redirect (loader)
   *   가 더 적절할 수 있으나, admin 영역은 이미 layout 에서 redirect 처리하므로
   *   여기 도달했다는 건 로그인은 한 상태. 권한만 부족하므로 403 으로 통일.
   */
  requirePermissions(permission: string[], requireAll: boolean = false): void {
    if (!this.checkPermissions(permission, requireAll)) {
      throw new Response("권한이 없습니다.", { status: 403 });
    }
  }

  isSuperAdmin() {
    return this.roles.includes("super_admin");
  }

  requireSuperAdmin(): void {
    if (!this.isSuperAdmin()) {
      throw new Response("최고관리자 권한이 필요합니다.", { status: 403 });
    }
  }
}

const AuthServerContext = createContext<Auth | null>(null);

export function setAuthServerContext(
  context: Readonly<RouterContextProvider>,
  auth: Auth,
) {
  context.set(AuthServerContext, auth);
}

export function useAuthServerContext(context: Readonly<RouterContextProvider>) {
  const auth = context.get(AuthServerContext);
  if (!auth) {
    throw new Error(
      "useAuthServerContext must be used within an root.tsx context.set()",
    );
  }
  return auth;
}
