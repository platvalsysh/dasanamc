import { DoctorsOptions } from "@repo/module-doctors/server";
import { FileService } from "@repo/module-file/server";
import { CENTERS } from "./data/dasanone-content";

/**
 * 의료진 모듈 옵션 주입 (서버 부팅 시 1회, entry.server.tsx 에서 import).
 *
 * - 담당 센터 선택지: 외주 콘텐츠 CENTERS
 * - 사진 저장소: module-file (public-images 버킷). 모듈끼리는 직접 import 할 수
 *   없으므로 앱이 두 모듈을 여기서 연결한다.
 */
DoctorsOptions.setCenters(
  CENTERS.map((c) => ({ id: c.id, label: `${c.num} ${c.ko}` })),
);

DoctorsOptions.setPhotoStorage({
  async upload({ doctorId, file, userId }) {
    const { fileId } = await FileService.uploadDirectly({
      module: "doctors",
      targetId: doctorId,
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      userId: userId ?? undefined,
      buffer: Buffer.from(await file.arrayBuffer()),
    });
    // 미발행 파일은 정리 대상이 되므로 즉시 publish
    await FileService.publishFiles(doctorId);
    return { fileId };
  },
  remove: (fileId) => FileService.deleteFile(fileId),
  publicUrl: (file) => FileService.getStoragePublicUrl(file),
});
