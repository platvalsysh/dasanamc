import { describe, it, expect } from "vitest";
import {
  signVerificationToken,
  verifyVerificationToken,
  signVerifiedToken,
  verifyVerifiedToken,
} from "../src/.server/phone-verify";

describe("phone-verify", () => {
  const phone = "010-1234-5678";
  const code = "123456";

  it("verification token: 같은 phone+code 조합으로 검증 통과", () => {
    const token = signVerificationToken(phone, code);
    expect(verifyVerificationToken(phone, token, code)).toBe(true);
  });

  it("verification token: 다른 코드/번호/위조 토큰 거부", () => {
    const token = signVerificationToken(phone, code);
    expect(verifyVerificationToken(phone, token, "999999")).toBe(false);
    expect(verifyVerificationToken("010-9999-9999", token, code)).toBe(false);
    expect(verifyVerificationToken(phone, "garbage", code)).toBe(false);
    expect(verifyVerificationToken(phone, "", code)).toBe(false);
  });

  it("verification token: 페이로드 변조 후 시그니처 미일치", () => {
    const token = signVerificationToken(phone, code);
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [tPhone, tExpiry, tSignature] = decoded.split(":");
    const tampered = Buffer.from(`${tPhone}:${parseInt(tExpiry) + 60_000}:${tSignature}`).toString("base64");
    expect(verifyVerificationToken(phone, tampered, code)).toBe(false);
  });

  it("verified token: 같은 phone 으로 발급/검증 통과", () => {
    const token = signVerifiedToken(phone);
    expect(verifyVerifiedToken(phone, token)).toBe(true);
  });

  it("verified token: 다른 번호/위조 토큰 거부", () => {
    const token = signVerifiedToken(phone);
    expect(verifyVerifiedToken("010-0000-0000", token)).toBe(false);
    expect(verifyVerifiedToken(phone, "")).toBe(false);
    expect(verifyVerifiedToken(phone, "not-base64-or-anything")).toBe(false);
  });
});
