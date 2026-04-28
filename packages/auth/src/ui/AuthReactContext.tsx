import { createContext, useContext } from "react";
import type { User } from "../types/auth";
import { checkUserPermissions } from "../utils/permission-check";

export type AuthReactContextType = {
  user: User | null;
  permissions: string[];
  roles: string[];
};

const GLOBAL_AUTH_CONTEXT_KEY = "__REPO_AUTH_REACT_CONTEXT__";

export const AuthReactContext = (function () {
  const g = (typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
      ? global
      : {}) as any;
  if (!g[GLOBAL_AUTH_CONTEXT_KEY]) {
    g[GLOBAL_AUTH_CONTEXT_KEY] = createContext<AuthReactContextType | null>(null);
  }
  return g[GLOBAL_AUTH_CONTEXT_KEY];
})() as React.Context<AuthReactContextType | null>;

export const useAuth = () => {
  const ctx = useContext(AuthReactContext);
  if (!ctx) {
    throw new Error(
      "useAuth must be used inside <AuthReactContext.Provider>. Make sure it is rendered in root.tsx. This error might be hiding a deeper SSR error.",
    );
  }
  return ctx;
};

export function useUser() {
  const auth = useAuth();
  return auth.user;
}

export function useUserOrFail() {
  const auth = useAuth();
  if (auth.user === null) {
    throw new Error(
      "User is not authenticated. This hook should only be used when a user is guaranteed to exist.",
    );
  }
  return auth.user;
}

export function usePermissions() {
  const auth = useAuth();
  return auth.permissions;
}

export function useRoles() {
  const auth = useAuth();
  return auth.roles;
}

export function useIsSuperAdmin() {
  const auth = useAuth();
  return auth.roles.includes("super_admin");
}

export function useIsAdmin() {
  if (useIsSuperAdmin()) return true;
  const auth = useAuth();
  return auth.roles.includes("moderator");
}

export function useCheckPermissions(
  permission: string[],
  requireAll = false,
): boolean {
  const auth = useAuth();
  if (!auth.user) {
    return false;
  }

  return checkUserPermissions(
    permission,
    auth.permissions,
    auth.roles,
    requireAll,
  );
}