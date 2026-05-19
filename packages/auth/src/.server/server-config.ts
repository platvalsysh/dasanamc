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
 * 회원가입 폼 정책. admin UI 에서 토글 가능.
 *
 * - `smsVerification`: SMS OTP 사용 여부. false 면 휴대폰 인증 단계 스킵.
 *   휴대폰 번호 자체는 `collectPhone` 으로 별도 제어.
 * - `emailVerification`: Supabase Auth 의 email confirm 사용 여부.
 *   true 가 기본이며 OFF 시 회원가입 즉시 활성화.
 * - `collect*`: 회원가입 폼에서 받을 개인정보 항목 토글.
 *   `smsVerification` 이 true 면 `collectPhone` 은 강제 true 로 간주.
 */
export interface AuthRegistrationConfig {
  smsVerification: boolean;
  emailVerification: boolean;
  collectName: boolean;
  collectPhone: boolean;
  collectSex: boolean;
  collectAddress: boolean;
  marketingOptIn: boolean;
  messageOptIn: boolean;
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
  registration: {
    smsVerification: false,
    emailVerification: true,
    collectName: true,
    collectPhone: false,
    collectSex: false,
    collectAddress: false,
    marketingOptIn: true,
    messageOptIn: false,
  } as AuthRegistrationConfig,
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

/**
 * 회원가입 정책 조회. `smsVerification` 이 true 면 `collectPhone` 도 강제 true
 * 로 정규화해서 반환 (잘못 저장된 상태에 대한 안전망).
 */
export async function getAuthRegistrationConfig(): Promise<AuthRegistrationConfig> {
  const raw = await configManager.get(
    "auth",
    "registration",
    DEFAULT_AUTH_CONFIG.registration,
  );
  if (raw.smsVerification && !raw.collectPhone) {
    return { ...raw, collectPhone: true };
  }
  return raw;
}

/**
 * 회원가입 정책 저장. `smsVerification` 켤 때 `collectPhone` 자동 강제.
 */
export async function setAuthRegistrationConfig(
  config: AuthRegistrationConfig,
): Promise<void> {
  const normalized: AuthRegistrationConfig = config.smsVerification
    ? { ...config, collectPhone: true }
    : config;
  await configManager.set(
    "auth",
    "registration",
    normalized,
    "Registration form policy",
  );
}
