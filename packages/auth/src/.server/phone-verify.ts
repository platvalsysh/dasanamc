import crypto from "node:crypto";

/**
 * 휴대폰 인증 토큰 발행/검증 + httpOnly 쿠키 헬퍼.
 *
 * 토큰을 React state 에 두면 XSS 페이로드가 `document` 또는 React fiber 를
 * 통해 추출할 수 있으므로, 이 모듈은 토큰을 절대 클라이언트 JS 에 노출하지 않고
 * httpOnly 쿠키로만 전달한다.
 *
 * - 인증 토큰(verification): SMS 발송 직후 5분간 유효. 코드 입력 시 검증.
 * - 검증완료 토큰(verified): 코드 검증 성공 직후 1시간 유효. 폼 최종 제출 시 검증.
 */

const VERIFY_SECRET = process.env.AUTH_SECRET || "default-secret-for-phone-verify";

const VERIFICATION_MAX_AGE = 5 * 60; // 5 min
const VERIFIED_MAX_AGE = 60 * 60; // 1 hour

export const VERIFICATION_COOKIE = "_pv_token";
export const VERIFIED_COOKIE = "_pv_verified";

export function signVerificationToken(phone: string, code: string): string {
  const expiry = Date.now() + VERIFICATION_MAX_AGE * 1000;
  const payload = `${phone}:${expiry}`;
  const signature = crypto.createHmac("sha256", VERIFY_SECRET).update(`${phone}:${code}:${expiry}`).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

export function verifyVerificationToken(phone: string, token: string, code: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    const [tPhone, tExpiry, tSignature] = parts;
    if (tPhone !== phone) return false;
    if (Date.now() > parseInt(tExpiry)) return false;
    const expectedSignature = crypto.createHmac("sha256", VERIFY_SECRET).update(`${tPhone}:${code}:${tExpiry}`).digest("hex");
    return timingSafeEqual(expectedSignature, tSignature);
  } catch {
    return false;
  }
}

export function signVerifiedToken(phone: string): string {
  const expiry = Date.now() + VERIFIED_MAX_AGE * 1000;
  const payload = `verified:${phone}:${expiry}`;
  const signature = crypto.createHmac("sha256", VERIFY_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

export function verifyVerifiedToken(phone: string, token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return false;
    const [prefix, tPhone, tExpiry, tSignature] = parts;
    if (prefix !== "verified" || tPhone !== phone) return false;
    if (Date.now() > parseInt(tExpiry)) return false;
    const expectedSignature = crypto.createHmac("sha256", VERIFY_SECRET).update(`${prefix}:${tPhone}:${tExpiry}`).digest("hex");
    return timingSafeEqual(expectedSignature, tSignature);
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function readCookie(request: Request, name: string): string {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function buildCookie(name: string, value: string, maxAge: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=/auth`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function setVerificationCookie(value: string): string {
  return buildCookie(VERIFICATION_COOKIE, value, VERIFICATION_MAX_AGE);
}

export function setVerifiedCookie(value: string): string {
  return buildCookie(VERIFIED_COOKIE, value, VERIFIED_MAX_AGE);
}

export function clearCookie(name: string): string {
  const parts = [
    `${name}=`,
    `Path=/auth`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=0`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}
