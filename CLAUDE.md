# CLAUDE.md — AI 에이전트 진입점

이 파일은 Claude Code, Cursor 등 AI 에이전트가 이 저장소에서 작업할 때 가장 먼저 읽는 문서이다.

## 한 줄 요약
React Router 7 + pnpm + Turborepo로 만든 **모듈식 홈페이지 템플릿**. 외주 프로젝트마다 [packages/module-*](packages/) 를 골라 끼워 사용한다.

## 진입 순서
1. [AGENTS.md](AGENTS.md) — 운영 규칙 (한국어 응답, DB 마이그레이션 정책, Windows 셸)
2. [packages/INDEX.md](packages/INDEX.md) — 패키지 매트릭스
3. [docs/guidelines/](docs/guidelines/) — 주제별 컨벤션
4. [packages/core/README.md](packages/core/README.md) — 모듈 시스템 동작 원리

## 자주 하는 작업

| 작업 | 시작 위치 |
|---|---|
| 새 모듈 만들기 | `pnpm new:module <이름>` 후 [docs/guidelines/module-development.md](docs/guidelines/module-development.md) |
| 라우트 추가 | 해당 모듈의 `src/routes.server.ts` |
| 권한 추가 | 해당 모듈의 `src/module.server.ts` `.permissions([...])` |
| 폼 작성 | [docs/guidelines/form-handling.md](docs/guidelines/form-handling.md) |
| 에러 처리 | [docs/guidelines/error-handling.md](docs/guidelines/error-handling.md) |
| 상태 어디 둘지 결정 | [docs/guidelines/state-management.md](docs/guidelines/state-management.md) |
| 다국어 작업 | [docs/guidelines/i18n.md](docs/guidelines/i18n.md) |
| DB 스키마 변경 | **`schema.prisma` 직접 수정 금지**. `packages/{모듈}/migrate/*.sql` 작성 후 `pnpm db:migrate && pnpm db:pull && pnpm db:gen` |

## 절대 하지 말 것

- `schema.prisma` 직접 수정 (SQL 마이그레이션을 통한 변경만)
- 빌드 도구를 `devDependencies`에 추가 (Vercel `pnpm install --prod` 시 빌드 깨짐)
- 모듈 간 직접 import (`@repo/module-board`이 `@repo/module-editor`를 부르는 식). 공통은 `@repo/core` 또는 `@repo/shared-*`로 승격
- 시크릿/토큰을 React `useState`에 저장 (XSS 위험). hidden input 또는 httpOnly 쿠키 사용
- bash에서 `&&`로 명령 체이닝 (Windows 환경 호환성). `;`로 분리

## 셸 / 플랫폼
- OS: Windows 11 (PowerShell 또는 git-bash)
- 패키지 매니저: **pnpm 9.x** (`only-allow pnpm` 강제)
- Node: `>=22`

## 빌드/실행

```bash
pnpm install
pnpm dev          # turbo dev (모든 패키지 병렬)
pnpm typecheck
pnpm format
pnpm db:migrate   # SQL 마이그레이션 적용
pnpm new:module <이름>  # 신규 모듈 스캐폴드
```

## 외주 프로젝트로 이 템플릿을 시작할 때

1. 이 저장소 복제 → 새 리모트 연결
2. `.env.example` → `.env` 복사 후 클라이언트별 시크릿 채우기. `ENABLED_MODULES` 로 사용할 모듈만 활성화 (예: `ENABLED_MODULES=board,bxmember`). `core`/`auth`/`admin` 은 항상 활성
3. (선택) 영원히 안 쓸 모듈은 `packages/module-*` 디렉토리 자체를 삭제 가능 (`apps/web/app/modules.server.ts` import 제거 후)
4. `apps/web/app/components/` 의 홈페이지 컨텐츠 수정

> 이 템플릿은 chemeng 프로젝트로부터 복사된 시점 스냅샷이다. 시작 전 `git log --oneline -1` 로 시점 확인.
