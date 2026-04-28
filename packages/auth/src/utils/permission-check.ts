export function checkUserPermissions(
  requiredPermissions: string | string[],
  userPermissions: string[],
  userRoles: string[],
  requireAll = false,
): boolean {
  if (userRoles.includes("super_admin")) {
    return true;
  }

  const permissionsToCheck = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  if (permissionsToCheck.length === 0) {
    return true;
  }

  /*
   * Wildcard Matching Logic:
   * 1. Exact match: "auth.users.create" === "auth.users.create"
   * 2. Global wildcard: "*" covers everything
   * 3. Prefix wildcard: "auth.*" covers "auth.users.create", "auth.users.*" covers "auth.users.create"
   */
  const checkSinglePermission = (required: string) => {
    // 1. Exact match
    if (userPermissions.includes(required)) return true;

    // 2. Wildcard match
    if (userPermissions.includes("*")) return true;

    const parts = required.split(".");
    // Iterate from general to specific is not needed, we need to find IF ANY user permission covers this required one
    // OR construct potential wildcards from the required string and check if user has them.
    // Constructing potential wildcards is safer and simpler:
    // For "auth.users.create": check "auth.users.*", "auth.*"

    for (let i = parts.length - 1; i >= 1; i--) {
      const wildcard = parts.slice(0, i).join(".") + ".*";
      if (userPermissions.includes(wildcard)) return true;
    }
    return false;
  };

  if (requireAll) {
    return permissionsToCheck.every((p) => checkSinglePermission(p));
  } else {
    return permissionsToCheck.some((p) => checkSinglePermission(p));
  }
}
