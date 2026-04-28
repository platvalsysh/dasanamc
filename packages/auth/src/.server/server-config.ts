import { configManager } from "@repo/core/server";

/**
 * Auth module configuration types
 */
export interface AuthLoginConfig {
  phone: boolean;
  email: boolean;
  login_id: boolean;
}

/**
 * Default auth configuration values
 */
export const DEFAULT_AUTH_CONFIG = {
  login: {
    phone: true,
    email: true,
    login_id: true,
  } as AuthLoginConfig,
} as const;

/**
 * Get auth login configuration from database with default fallback
 *
 * @returns Auth login configuration
 *
 * @example
 * ```typescript
 * const loginConfig = await getAuthLoginConfig();
 * if (loginConfig.email) {
 *   // Enable email login
 * }
 * ```
 */
export async function getAuthLoginConfig(): Promise<AuthLoginConfig> {
  return await configManager.get("auth", "login", DEFAULT_AUTH_CONFIG.login);
}

/**
 * Set auth login configuration in database
 *
 * @param config - Auth login configuration
 *
 * @example
 * ```typescript
 * await setAuthLoginConfig({
 *   phone: false,
 *   email: true,
 *   login_id: true,
 * });
 * ```
 */
export async function setAuthLoginConfig(
  config: AuthLoginConfig,
): Promise<void> {
  await configManager.set(
    "auth",
    "login",
    config,
    "Login method configuration",
  );
}
