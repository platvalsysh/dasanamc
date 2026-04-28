# @repo/module-file

파일 업로드/저장/관리 모듈. Supabase Storage 와 사이트 자체 metadata 테이블을 함께 사용.

## 진입점

```ts
import { module as file } from "@repo/module-file/module";
```

## 흐름 (presigned upload)

1. 클라이언트 → `POST /api/file/upload-url` 으로 presigned URL 요청
2. 클라이언트 → presigned URL 로 직접 파일 PUT
3. 클라이언트 → `POST /api/file/mark-uploaded` 로 서버에 완료 통지
4. 서버: `files` 테이블에 메타데이터 기록 (mime, 크기, 소유자 등) + 썸네일 트리거

## 라우트

- API: `/api/file/upload-url`, `/api/file/publish`, `/api/file/mark-uploaded`, `/api/file/delete`, `/api/file/thumbnail`
- 관리자: `/admin/files` (파일 인벤토리, 미사용 파일 정리)

## 권한

- `file.upload` — 업로드 가능
- `file.delete.own` — 본인이 올린 것만 삭제
- `file.delete.any` — 모든 파일 삭제 (관리자)

## Supabase Storage 버킷

- `public` — 사이트에 게시되는 첨부 (썸네일 포함)
- `private` — 인증 사용자만 접근

`packages/auth/src/.server/SupabaseStorage.ts` 가 클라이언트 인스턴스화 담당.
