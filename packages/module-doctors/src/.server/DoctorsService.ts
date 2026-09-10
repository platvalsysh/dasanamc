import { prisma, type Prisma } from "@repo/database";
import type { DoctorInput, DoctorPhotoUpload, DoctorView } from "../types";
import { DoctorsOptions } from "./DoctorsOptions";

const withPhoto = { files: true } as const;
type DoctorRow = Prisma.doctorsGetPayload<{ include: typeof withPhoto }>;

const ORDER: Prisma.doctorsOrderByWithRelationInput[] = [
  { list_order: "asc" },
  { created_at: "asc" },
];

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function toView(row: DoctorRow): DoctorView {
  const storage = DoctorsOptions.getPhotoStorage();
  const uploadedUrl = row.files && storage ? storage.publicUrl(row.files) : null;
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    cred: row.cred,
    quote: row.quote,
    greeting: row.greeting,
    career: toStringArray(row.career),
    centers: toStringArray(row.centers),
    photoUrl: uploadedUrl ?? row.photo_url ?? null,
    photoFileId: row.photo_file_id,
    isChief: row.is_chief,
    isActive: row.is_active,
    listOrder: row.list_order,
    updatedAt: row.updated_at?.toISOString() ?? null,
  };
}

function toData(input: DoctorInput) {
  return {
    name: input.name,
    title: input.title,
    cred: input.cred,
    quote: input.quote,
    greeting: input.greeting,
    career: input.career as Prisma.InputJsonValue,
    centers: input.centers as Prisma.InputJsonValue,
    photo_url: input.photoUrl.trim() === "" ? null : input.photoUrl.trim(),
    is_chief: input.isChief,
    is_active: input.isActive,
    list_order: input.listOrder,
  };
}

async function removeStoredPhoto(fileId: string, where: string) {
  const storage = DoctorsOptions.getPhotoStorage();
  if (!storage) return;
  await storage.remove(fileId).catch((e) => {
    console.error(`[doctors.${where}] 사진 파일 삭제 실패`, e);
  });
}

/**
 * 의료진 CRUD — 모든 DB 접근은 Prisma 로만.
 * 공개 페이지(apps/web)와 admin 이 함께 사용한다.
 * 사진 파일 저장/삭제는 앱이 주입한 `DoctorPhotoStorage` 어댑터에 위임.
 */
export class DoctorsService {
  /** admin 전체 목록 (비노출 포함) */
  static async listAll(): Promise<DoctorView[]> {
    const rows = await prisma.doctors.findMany({ include: withPhoto, orderBy: ORDER });
    return rows.map(toView);
  }

  /** 사이트 노출 의료진 */
  static async listActive(): Promise<DoctorView[]> {
    const rows = await prisma.doctors.findMany({
      where: { is_active: true },
      include: withPhoto,
      orderBy: ORDER,
    });
    return rows.map(toView);
  }

  /** 특정 센터 담당 의료진 (노출 중인 것만) */
  static async listActiveByCenter(centerId: string): Promise<DoctorView[]> {
    const rows = await prisma.doctors.findMany({
      where: { is_active: true, centers: { array_contains: [centerId] } },
      include: withPhoto,
      orderBy: ORDER,
    });
    return rows.map(toView);
  }

  static async getById(id: string): Promise<DoctorView | null> {
    const row = await prisma.doctors.findUnique({ where: { id }, include: withPhoto });
    return row ? toView(row) : null;
  }

  static async create(input: DoctorInput): Promise<DoctorView> {
    const row = await prisma.doctors.create({ data: toData(input), include: withPhoto });
    return toView(row);
  }

  static async update(id: string, input: DoctorInput): Promise<DoctorView> {
    const row = await prisma.doctors.update({
      where: { id },
      data: toData(input),
      include: withPhoto,
    });
    return toView(row);
  }

  /** 프로필 삭제 — 업로드 사진 파일도 함께 정리 */
  static async remove(id: string): Promise<void> {
    const row = await prisma.doctors.findUnique({ where: { id }, select: { photo_file_id: true } });
    if (!row) return;
    await prisma.doctors.delete({ where: { id } });
    if (row.photo_file_id) await removeStoredPhoto(row.photo_file_id, "remove");
  }

  /**
   * 사진 업로드 후 프로필에 연결. 기존 업로드 사진은 교체(삭제)된다.
   */
  static async attachPhoto(
    id: string,
    photo: DoctorPhotoUpload,
    userId: string | null,
  ): Promise<void> {
    const storage = DoctorsOptions.requirePhotoStorage();
    const current = await prisma.doctors.findUnique({
      where: { id },
      select: { photo_file_id: true },
    });
    if (!current) throw new Error("Doctor not found");

    const { fileId } = await storage.upload({ doctorId: id, file: photo, userId });
    await prisma.doctors.update({ where: { id }, data: { photo_file_id: fileId } });

    if (current.photo_file_id) await removeStoredPhoto(current.photo_file_id, "attachPhoto");
  }

  /** 업로드 사진·정적 URL 모두 제거 */
  static async removePhoto(id: string): Promise<void> {
    const current = await prisma.doctors.findUnique({
      where: { id },
      select: { photo_file_id: true },
    });
    if (!current) return;
    await prisma.doctors.update({
      where: { id },
      data: { photo_file_id: null, photo_url: null },
    });
    if (current.photo_file_id) await removeStoredPhoto(current.photo_file_id, "removePhoto");
  }
}
