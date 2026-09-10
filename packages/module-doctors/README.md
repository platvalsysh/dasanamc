# @repo/module-doctors — 의료진 관리

병원 의료진 프로필을 DB(`modules.doctors`)로 관리하고 admin 에서 편집하는 모듈.

## 구성

| 항목 | 내용 |
|---|---|
| 테이블 | `modules.doctors` — [migrate/001_init.sql](migrate/001_init.sql), 초기 6명 시드 [migrate/002_seed.sql](migrate/002_seed.sql) |
| admin | `/admin/doctors` 목록 · `/admin/doctors/new` · `/admin/doctors/:id/edit` · `/admin/doctors/:id/delete` (POST) |
| 권한 | `doctors.*`, `doctors.list`, `doctors.edit`, `doctors.delete` |
| 역할 | `moderator`(운영자)에 `doctors.*` 부여 — core 의 같은 역할 선언과 합집합으로 동기화 |
| 메뉴 | 콘텐츠 그룹 → "의료진 관리" |
| 서버 API | `@repo/module-doctors/server` → `DoctorsService`, `DoctorsOptions` |

## 공개 페이지 연결 (apps/web)

```ts
import { DoctorsService } from "@repo/module-doctors/server";

const doctors = await DoctorsService.listActive();            // 의료진 소개
const team = await DoctorsService.listActiveByCenter("ortho"); // 센터 상세
```

## 앱이 주입해야 하는 옵션

모듈은 다른 모듈(module-file)이나 앱 데이터를 직접 import 하지 않는다.
`apps/web/app/doctors.server.ts` 가 부팅 시 다음을 주입한다.

- `DoctorsOptions.setCenters([{ id, label }])` — admin 폼의 담당 센터 선택지
- `DoctorsOptions.setPhotoStorage({ upload, remove, publicUrl })` — 사진 저장소 어댑터
  (module-file 의 `FileService` 로 구현). 미주입 시 업로드는 실패하고 정적 URL 만 사용 가능

## 사진

- 업로드 사진: `photo_file_id` → `modules.files` (FK, 파일 삭제 시 NULL)
- 정적/외부 URL: `photo_url` (업로드 사진이 있으면 업로드가 우선)
