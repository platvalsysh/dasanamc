/** 공개 페이지·admin 이 공통으로 쓰는 의료진 뷰 모델 (DB row → 정규화) */
export interface DoctorView {
  id: string;
  /** 이름 */
  name: string;
  /** 직책 (예: 대표원장 · 외과) */
  title: string;
  /** 약력 한 줄 요약 */
  cred: string;
  /** 진료 철학 인용구 */
  quote: string;
  /** 인사말 */
  greeting: string;
  /** 전체 약력 */
  career: string[];
  /** 담당 센터 id (apps/web CENTERS.id) */
  centers: string[];
  /** 사진 URL — 업로드 파일이 있으면 그 공개 URL, 없으면 photo_url, 둘 다 없으면 null */
  photoUrl: string | null;
  /** 업로드 사진 파일 id (module-file) */
  photoFileId: string | null;
  isChief: boolean;
  isActive: boolean;
  listOrder: number;
  updatedAt: string | null;
}

/** 등록/수정 입력값 */
export interface DoctorInput {
  name: string;
  title: string;
  cred: string;
  quote: string;
  greeting: string;
  career: string[];
  centers: string[];
  /** 정적/외부 사진 URL (빈 문자열이면 null 저장) */
  photoUrl: string;
  isChief: boolean;
  isActive: boolean;
  listOrder: number;
}

/** admin 폼의 담당 센터 선택지 — 앱이 `DoctorsOptions.setCenters` 로 주입 */
export interface CenterOption {
  id: string;
  label: string;
}

/** 사진 업로드 시 넘기는 파일 정보 (Web File 또는 동등 객체) */
export interface DoctorPhotoUpload {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

/** modules.files 행 중 공개 URL 계산에 필요한 컬럼 */
export interface DoctorPhotoFileRef {
  storage_type: string;
  local_path: string | null;
  s3_bucket: string | null;
  s3_key: string | null;
}

/**
 * 사진 저장소 어댑터 — 모듈 간 직접 의존 금지 규칙에 따라 module-file 을 여기서
 * import 하지 않고, 앱(apps/web)이 `DoctorsOptions.setPhotoStorage` 로 주입한다.
 */
export interface DoctorPhotoStorage {
  /** 업로드 후 modules.files 의 id 반환 (publish 까지 완료된 상태여야 함) */
  upload(params: {
    doctorId: string;
    file: DoctorPhotoUpload;
    userId: string | null;
  }): Promise<{ fileId: string }>;
  /** 파일 레코드 + 스토리지 객체 삭제 */
  remove(fileId: string): Promise<void>;
  /** files 행 → 공개 URL (계산 불가 시 null) */
  publicUrl(file: DoctorPhotoFileRef): string | null;
}
