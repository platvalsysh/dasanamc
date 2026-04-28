import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  passwordStrongSchema,
  yesNoSchema,
  graduateMonthSchema,
  personalFields,
  allEducationFields,
  officeFields,
  settingsFields,
  refineAtLeastOneDegree,
} from "../src/profile";

describe("profile schemas", () => {
  it("이메일 형식 검증", () => {
    expect(emailSchema.safeParse("a@b.com").success).toBe(true);
    expect(emailSchema.safeParse("not-email").success).toBe(false);
  });

  it("password (6자) vs passwordStrong (8자) 길이 정책", () => {
    expect(passwordSchema.safeParse("123456").success).toBe(true);
    expect(passwordSchema.safeParse("12345").success).toBe(false);
    expect(passwordStrongSchema.safeParse("12345678").success).toBe(true);
    expect(passwordStrongSchema.safeParse("1234567").success).toBe(false);
  });

  it("yesNoSchema 기본값 N + Y/N 만 허용", () => {
    expect(yesNoSchema.parse(undefined)).toBe("N");
    expect(yesNoSchema.safeParse("Y").success).toBe(true);
    expect(yesNoSchema.safeParse("N").success).toBe(true);
    expect(yesNoSchema.safeParse("X").success).toBe(false);
  });

  it("graduateMonth: 빈문자열/2월/8월/undefined", () => {
    expect(graduateMonthSchema.safeParse("").success).toBe(true);
    expect(graduateMonthSchema.safeParse("2").success).toBe(true);
    expect(graduateMonthSchema.safeParse("8").success).toBe(true);
    expect(graduateMonthSchema.safeParse(undefined).success).toBe(true);
    expect(graduateMonthSchema.safeParse("3").success).toBe(false);
  });

  it("personalFields 컴포지션", () => {
    const schema = z.object(personalFields);
    expect(
      schema.safeParse({
        name_kor: "홍길동",
        sex: "남",
        cellphone_number: "010-1234-5678",
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        name_kor: "",
        sex: "남",
        cellphone_number: "010-1234-5678",
      }).success,
    ).toBe(false);
  });

  it("officeFields/settingsFields 컴포지션", () => {
    const office = z.object(officeFields).parse({});
    expect(office.office_name).toBeUndefined();
    const settings = z.object(settingsFields).parse({});
    expect(settings.search_agree).toBe("N");
    expect(settings.allow_mailing).toBe("N");
  });

  it("refineAtLeastOneDegree: 학사/석사/박사 중 하나는 있어야 함", () => {
    const eduSchema = refineAtLeastOneDegree(z.object(allEducationFields));
    expect(eduSchema.safeParse({ major: "화공" }).success).toBe(true);
    expect(eduSchema.safeParse({ master_major: "AI" }).success).toBe(true);
    expect(eduSchema.safeParse({}).success).toBe(false);
  });
});
