import { configManager } from "@repo/core/server";
import { type Auth } from "@repo/auth/server";

export async function checkMemberPublicAccess(auth: Auth): Promise<boolean> {
  // Configured default: No access if no config
  const accessConfig = await configManager.getModule<{ roles: string[] }>(
    "bxmember",
    "public_access",
    {
      roles: [],
    }
  );

  // Super Admin Bypass
  if (auth.isSuperAdmin()) {
    return true;
  }

  // If no roles configured, deny access (unless super admin)
  if (accessConfig.roles.length === 0) {
    return false;
  }

  const user = auth.getUser();
  if (!user) {
    return false;
  }

  const userRoles = auth.getRoles();
  const hasAccess = accessConfig.roles.some((role) => userRoles.includes(role));

  return hasAccess;
}
