import React from "react";
import { useCheckPermissions } from "./AuthReactContext";

interface PermissionGateProps {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // 모든 권한이 필요한지 (AND) vs 하나만 (OR)
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
  requireAll = false,
}: PermissionGateProps) {
  const permissionsToCheck = Array.isArray(permission)
    ? permission
    : [permission];

  const hasAccess = useCheckPermissions(permissionsToCheck, requireAll);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
