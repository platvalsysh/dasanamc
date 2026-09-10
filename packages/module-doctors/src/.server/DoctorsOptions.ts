import type { CenterOption, DoctorPhotoStorage } from "../types";

/**
 * 앱이 부팅 시 주입하는 모듈 옵션 레지스트리.
 *
 * - 센터 선택지: 외주별 콘텐츠(apps/web/app/data)라 모듈이 직접 import 할 수 없다
 *   (모듈 → 앱 의존 금지).
 * - 사진 저장소: module-file 을 모듈에서 직접 의존하면 "모듈 간 직접 import 금지"
 *   규칙(syncpack 강제)에 걸리므로 앱이 어댑터로 넘긴다.
 *
 * 주입 지점: apps/web/app/doctors.server.ts (entry.server.tsx 가 import)
 */
let centers: CenterOption[] = [];
let photoStorage: DoctorPhotoStorage | null = null;

export const DoctorsOptions = {
  setCenters(list: readonly CenterOption[]) {
    centers = list.map((c) => ({ id: c.id, label: c.label }));
  },
  getCenters(): CenterOption[] {
    return centers;
  },
  /** id → 표시명 (미등록 id 는 id 그대로) */
  centerLabel(id: string): string {
    return centers.find((c) => c.id === id)?.label ?? id;
  },

  setPhotoStorage(storage: DoctorPhotoStorage) {
    photoStorage = storage;
  },
  /** 미주입 상태면 null — 업로드 UI 는 비활성, 정적 URL 만 사용 가능 */
  getPhotoStorage(): DoctorPhotoStorage | null {
    return photoStorage;
  },
  requirePhotoStorage(): DoctorPhotoStorage {
    if (!photoStorage) {
      throw new Error(
        "[module-doctors] 사진 저장소가 주입되지 않았습니다. DoctorsOptions.setPhotoStorage() 를 앱 부팅 시 호출하세요.",
      );
    }
    return photoStorage;
  },
};
