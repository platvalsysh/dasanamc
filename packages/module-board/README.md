# @repo/module-board

게시판 모듈. 다중 게시판 인스턴스 (`mid` 단위), 게시글 CRUD, 댓글, 첨부파일, 권한별 접근 제어.

## 진입점

```ts
import { module as board } from "@repo/module-board/module";
```

`apps/web/app/modules.server.ts` 에 등록.

## 라우트

- 공개: `/board/:mid`, `/board/:mid/read/:id`, `/board/:mid/write`, `/board/:mid/edit/:id`
- 관리자: `/admin/board` (인스턴스 관리), `/admin/board/edit/:id` (스킨/권한 설정)
- API: `/api/board/widget` 등

## 데이터 모델

- `modules` 테이블의 `module='board'` 행 1개 = 게시판 1개
- `documents` 테이블이 글, `comments` 테이블이 댓글
- `BoardExtraVars` 가 게시판 설정(스킨, 권한, 페이징, 표시 컬럼 등) 을 JSONB 로 보관
- `PostExtraVars` 가 글 메타(`has_image`, `has_video`, `has_file`) 보관

## 권한

`board.list`, `board.read`, `board.write`, `board.comment`, `board.delete`, `board.manage` — 게시판별 `BoardPermissionConfig` 로 세분화 (전체/회원/관리자/특정 그룹).

## 의존성 (legacy)

⚠️ `@repo/module-editor`, `@repo/module-file` 직접 import — 정리 대상 ([docs/guidelines/monorepo.md](../../docs/guidelines/monorepo.md) 참고). 신규 모듈은 다른 모듈을 import 하지 말 것.

## 스킨

`src/components/skins/default/` 가 기본 스킨. 새 스킨은 같은 인터페이스를 구현해 추가 후 `BoardExtraVars.skin` 에 이름 지정.
