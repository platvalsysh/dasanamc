import { z } from "zod";

/**
 * 프로필 필드 단위 zod 스키마. 회원가입(sign-up) / 마이페이지(mypage) /
 * 관리자 사용자 편집 등에서 동일 정의를 재사용한다.
 *
 * 단일 컴포지션 단위로 분리해 두면 화면별로 필요한 필드만 골라
 * `z.object({ ... })` 로 재구성할 수 있다. 인라인 정의 중복 → 스키마 드리프트
 * (예: 회원가입과 마이페이지의 휴대폰 검증 길이가 어긋남) 방지가 목적.
 */

export const yesNoSchema = z.enum(["Y", "N"]).default("N");

export const koreanNameSchema = z
  .string()
  .min(1, "이름을 입력해 주세요.");

export const displayNameSchema = z
  .string()
  .min(1, "닉네임을 입력해 주세요.");

export const emailSchema = z
  .string()
  .email("올바른 이메일 형식이 아닙니다.");

export const passwordSchema = z
  .string()
  .min(6, "비밀번호는 최소 6자 이상이어야 합니다.");

export const passwordStrongSchema = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다.");

export const sexSchema = z
  .string()
  .min(1, "성별을 선택해 주세요.");

export const phoneRequiredSchema = z
  .string()
  .min(1, "휴대폰 번호를 입력해 주세요.");

export const graduateMonthSchema = z.enum(["", "2", "8"]).optional();

/**
 * 학력 한 단계(학사/석사/박사) 공통 필드. prefix 를 받아 키 이름을
 * 합성하는 식으로 쓰기보단, 호출처에서 키 이름만 골라 묶는다.
 */
export const educationLevelFields = {
  major: z.string().optional(),
  graduate_year: z.string().optional(),
  graduate_month: graduateMonthSchema,
  graduate_number: z.string().optional(),
};

export const masterEducationFields = {
  master_major: z.string().optional(),
  master_graduate_year: z.string().optional(),
  master_graduate_month: graduateMonthSchema,
  master_graduate_number: z.string().optional(),
};

export const doctorEducationFields = {
  doctor_major: z.string().optional(),
  doctor_graduate_year: z.string().optional(),
  doctor_graduate_month: graduateMonthSchema,
  doctor_graduate_number: z.string().optional(),
};

export const officeFields = {
  office_name: z.string().optional(),
  office_position: z.string().optional(),
  job_class: z.string().optional(),
  office_phone_number: z.string().optional(),
  office_area: z.string().optional(),
  office_address: z.string().optional(),
  office_career: z.string().optional(),
};

export const personalFields = {
  name_kor: koreanNameSchema,
  sex: sexSchema,
  cellphone_number: phoneRequiredSchema,
  phone_number: z.string().optional(),
  address: z.string().optional(),
};

/**
 * 검색·공개·수신 동의 7종. 라디오/체크박스의 Y/N 토글에 사용.
 */
export const settingsFields = {
  search_agree: yesNoSchema,
  o_cellphone_number: yesNoSchema,
  o_email_address: yesNoSchema,
  o_office_name: yesNoSchema,
  o_office_position: yesNoSchema,
  allow_mailing: yesNoSchema,
  allow_message: yesNoSchema,
};

/**
 * 모든 학력 단계 + 입학연도 - 사용처(회원가입, 마이페이지 학력 수정)에서
 * 공통으로 묶어 쓴다.
 */
export const allEducationFields = {
  enter_year: z.string().optional(),
  ...educationLevelFields,
  ...masterEducationFields,
  ...doctorEducationFields,
};

/**
 * 학사·석사·박사 중 최소 하나는 있어야 한다 — refine 로직을 표준화.
 */
export function refineAtLeastOneDegree<T extends Record<string, unknown>>(schema: z.ZodType<T>) {
  return schema.refine(
    (data: T) =>
      !!(
        (data as Record<string, unknown>).major ||
        (data as Record<string, unknown>).master_major ||
        (data as Record<string, unknown>).doctor_major
      ),
    {
      message: "학사, 석사, 박사 정보 중 최소 하나는 입력하거나 선택해야 합니다.",
      path: ["major"],
    },
  );
}
