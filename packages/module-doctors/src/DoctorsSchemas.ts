import { z } from "zod";
import type { DoctorInput } from "./types";

/** 사진 업로드 제한 */
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_ACCEPT = ["image/png", "image/jpeg", "image/webp"];

/**
 * admin 등록/수정 폼 스키마.
 * - career: textarea 한 줄 = 약력 한 항목
 * - centers: 같은 name 의 체크박스 여러 개 → `formData.getAll` 로 배열 구성
 * - 체크박스는 미체크 시 값이 오지 않으므로 "on" 여부로 변환
 */
export const DoctorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요.")
    .max(50, "이름은 50자 이내로 입력해주세요."),
  title: z
    .string()
    .trim()
    .min(1, "직책을 입력해주세요.")
    .max(100, "직책은 100자 이내로 입력해주세요."),
  cred: z.string().trim().max(500, "약력 요약은 500자 이내로 입력해주세요.").default(""),
  quote: z.string().trim().max(300, "인용구는 300자 이내로 입력해주세요.").default(""),
  greeting: z.string().trim().max(3000, "인사말은 3000자 이내로 입력해주세요.").default(""),
  career: z
    .string()
    .default("")
    .transform((v) =>
      v
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  centers: z.array(z.string().trim().min(1)).default([]),
  photo_url: z.string().trim().max(500, "사진 URL 은 500자 이내로 입력해주세요.").default(""),
  is_chief: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  is_active: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  list_order: z.coerce
    .number()
    .int("정렬 순서는 정수로 입력해주세요.")
    .min(0, "정렬 순서는 0 이상이어야 합니다.")
    .max(9999, "정렬 순서는 9999 이하여야 합니다.")
    .default(0),
  remove_photo: z
    .string()
    .optional()
    .transform((v) => v === "on"),
});

export type DoctorFormValues = z.infer<typeof DoctorFormSchema>;

/** FormData → 검증. 실패 시 첫 번째 에러 메시지를 돌려준다. */
export function parseDoctorForm(formData: FormData):
  | { success: true; data: DoctorFormValues }
  | { success: false; error: string } {
  const values: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  values.centers = formData.getAll("centers").filter((v): v is string => typeof v === "string");

  const result = DoctorFormSchema.safeParse(values);
  if (!result.success) {
    const first = Object.values(result.error.flatten().fieldErrors).flat()[0];
    return { success: false, error: first ?? "필수 항목을 입력해주세요." };
  }
  return { success: true, data: result.data };
}

export function toDoctorInput(v: DoctorFormValues): DoctorInput {
  return {
    name: v.name,
    title: v.title,
    cred: v.cred,
    quote: v.quote,
    greeting: v.greeting,
    career: v.career,
    centers: v.centers,
    photoUrl: v.photo_url,
    isChief: v.is_chief,
    isActive: v.is_active,
    listOrder: v.list_order,
  };
}

/** multipart 로 올라온 사진 파일 검증. 파일이 없으면 null (에러 아님). */
export function pickPhotoFile(formData: FormData): { file: File } | { error: string } | null {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return null;
  if (!PHOTO_ACCEPT.includes(photo.type)) {
    return { error: "사진은 PNG · JPG · WebP 형식만 업로드할 수 있습니다." };
  }
  if (photo.size > PHOTO_MAX_BYTES) {
    return { error: "사진 용량은 10MB 이하여야 합니다." };
  }
  return { file: photo };
}
