# 패키지 인덱스

이 모노레포의 모든 워크스페이스 패키지의 역할/공개 API/의존 관계를 한 표로 보여준다. **새 작업 시작 전 진입점.**

## 인프라 패키지

| 패키지 | 역할 | 주요 export |
|---|---|---|
| [@repo/core](core/) | 모듈 시스템 코어 (`createModule`, `ModuleManager`, `JsonResponse`) | `./server`, `./module`, `./types`, `./ui`, `./utils` |
| [@repo/database](database/) | Prisma 클라이언트 + SQL 마이그레이션 + 생성 타입 | `@repo/database` |
| [@repo/env](env/) | `process.env` 타입 안전 접근 | `./` |
| [@repo/config-typescript](config-typescript/) | tsconfig base | `./base.json` 외 |

## 인증/관리

| 패키지 | 역할 |
|---|---|
| [@repo/auth](auth/) | Supabase + bcrypt + SMS 인증, 로그인/회원가입 페이지 모듈 |
| [@repo/admin](admin/) | 관리자 패널 (메뉴 빌더 등 시스템 페이지) |

## UI / 레이아웃

| 패키지 | 역할 |
|---|---|
| [@repo/ui](ui/) | 공개 페이지용 컴포넌트 (Button, Card, PDF Viewer, Carousel) |
| [@repo/ui-admin](ui-admin/) | 관리자 대시보드용 (Table, Chart, dark theme — Radix 기반) |
| [@repo/layout-default](layout-default/) | 공개 사이트 레이아웃 (Header/Footer/Outlet) |
| [@repo/layout-admin](layout-admin/) | 관리자 레이아웃 (Sidebar/권한 체크) |
| [@repo/layout-example](layout-example/) | 레이아웃 작성 참고용. 프로덕션 미사용 |

## 기능 모듈 (선택적 사용)

각 모듈은 `createModule(name).routes().permissions().build()` 패턴으로 정의된다.

| 모듈 | 도메인 |
|---|---|
| [@repo/module-board](module-board/) | 게시판 |
| [@repo/module-bxmember](module-bxmember/) | 회원/동문 관리 |
| [@repo/module-editor](module-editor/) | 위지위그 에디터 (TipTap) |
| [@repo/module-file](module-file/) | 파일 업로드/관리 |
| [@repo/module-newsletter](module-newsletter/) | 뉴스레터 |
| [@repo/module-organization](module-organization/) | 조직도 |
| [@repo/module-schedule](module-schedule/) | 일정/캘린더 |
| [@repo/module-sms](module-sms/) | SMS 발송 |
| [@repo/module-sponsors](module-sponsors/) | 후원/스폰서 |
| [@repo/module-example](module-example/) | **참고용 — 새 모듈 작성 시 복제 베이스** |

## 의존성 규칙

```
apps/web
  └─ depends on → @repo/auth, @repo/admin, @repo/module-*, @repo/layout-*, @repo/ui*

@repo/module-*
  └─ depends on → @repo/core, @repo/auth, @repo/database, @repo/ui (또는 @repo/ui-admin)
  └─ NEVER → 다른 @repo/module-* (현재 일부 위반 — 개선 과제)

@repo/core
  └─ depends on → @repo/database
  └─ NEVER → @repo/module-*, @repo/auth, @repo/admin (역방향 의존 금지)
```

## 외주 프로젝트 모듈 선별 절차

1. `apps/web/app/modules.server.ts` 의 `modules` 배열에서 미사용 모듈 import 제거
2. `pnpm install` 로 워크스페이스 재해석
3. `pnpm typecheck` 통과 확인 — 만약 다른 모듈이 직접 import 하고 있다면 의존성 위반 (위 규칙 참고)
4. 위반 없는 미사용 모듈은 `packages/module-{name}/` 디렉토리째 삭제 가능
