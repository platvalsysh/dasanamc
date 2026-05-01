# chemeng-template

React Router 7 + pnpm + Turborepo 기반 **모듈식 홈페이지 외주 템플릿**.

기능 모듈을 골라 끼우는 방식으로 외주 프로젝트마다 빠르게 시작한다.

- AI 에이전트는 [CLAUDE.md](CLAUDE.md) 를 먼저 읽기
- 운영 규칙은 [AGENTS.md](AGENTS.md)
- 패키지 매트릭스는 [packages/INDEX.md](packages/INDEX.md)
- 주제별 가이드는 [docs/guidelines/](docs/guidelines/)

## 스택

- React Router 7 (Vite, SSR)
- pnpm 9.x workspace + Turborepo (only-allow pnpm 강제)
- TypeScript strict, ESM
- Supabase (Auth + Postgres + Storage)
- Prisma 7 (SQL 마이그레이션 → schema.prisma 역인출 방식)
- Tailwind 4, Radix UI

## 외주 시작 워크플로

### 1단계 — 저장소 복제 + 리모트 연결

```bash
git clone <chemeng-template> <새-프로젝트>
cd <새-프로젝트>
git remote remove origin
git remote add origin <외주-새-저장소>
git push -u origin master
pnpm install
```

### 2단계 — 환경 변수 + 모듈 선택

```bash
cp .env.example .env
```

[.env.example](.env.example) 의 안내대로 `.env` 채우기:

- **Supabase**: 클라이언트별로 새 Supabase 프로젝트 생성 후 URL / ANON_KEY / SERVICE_ROLE_KEY
- **DATABASE_URL / DIRECT_URL**: Supabase 의 Connection Pooler / Direct
- **`ENABLED_MODULES`**: 클라이언트가 쓸 모듈만 (예: `board,file,sms`). 비우면 전체 활성

활성 가능한 기능 모듈: `board`, `editor`, `file`, `newsletter`, `sms`
(`core`, `auth`, `admin` 은 `ENABLED_MODULES` 와 무관하게 항상 활성)

### 3단계 — DB 초기 세팅

```bash
pnpm db:migrate                          # core + 활성 모듈의 SQL 마이그레이션 실행
pnpm db:pull                             # 실제 DB 스키마 → schema.prisma 역인출
pnpm db:gen                              # Prisma 클라이언트 타입 재생성
pnpm --filter web db:init-permissions    # 권한 시드
```

> ⚠️ `schema.prisma` 직접 수정 금지. SQL 마이그레이션 워크플로 사용.
> 자세히는 [docs/guidelines/database-migration.md](docs/guidelines/database-migration.md).

### 4단계 — 브랜딩 / 컨텐츠 교체

클라이언트별로 *반드시* 손대는 곳:

| 위치 | 무엇을 |
|---|---|
| [apps/web/app/components/](apps/web/app/components/) (`hero-carousel`, `feature-section`, `news-section`, `newsletter-section`, `site-footer`) | 홈페이지 섹션 컨텐츠 |
| [apps/web/app/routes/home.tsx](apps/web/app/routes/home.tsx) | 홈 라우트 조립 |
| [apps/web/app/routes/about/](apps/web/app/routes/about/) | 회사 소개 정적 페이지 |
| [apps/web/app/routes/](apps/web/app/routes/) (`rules`, `privacy`, `email-reject`, `familysites`, `events`) | 이용약관 / 개인정보 / 이벤트 |
| [apps/web/app/app.css](apps/web/app/app.css) + `@repo/ui` 디자인 토큰 | 색상 / 폰트 |
| [apps/web/app/layouts/default.tsx](apps/web/app/layouts/default.tsx) | 헤더 / 푸터 메뉴 |

### 5단계 — 어드민 메뉴 / 권한 구성

```bash
pnpm dev
```

브라우저:
- `/admin/system/settings/menu` — 메뉴 빌더로 노출 메뉴 선택
- `/admin/system/settings/site-menu` — 공개 사이트 메뉴
- `/admin/system/settings/general` — 사이트 메타
- `/admin/users` — 초기 관리자 계정 생성 + 역할 / 권한 할당

### 6단계 — 검증

```bash
pnpm typecheck
pnpm test
pnpm syncpack:check
pnpm build       # Vercel 배포 전 사전 검증
```

### 7단계 — 배포

Vercel 권장. 환경변수 등록 후 `pnpm build` 가 정상이면 그대로 배포.

`turbo.json` 의 `globalEnv` 에 새 환경변수를 추가하면 빌드 캐시 키에 반영됨.

## 클라이언트 도메인 기능 추가

```bash
pnpm new:module <이름>
```

스캐폴드된 `module.server.ts` / `routes.server.ts` / `migrate/*.sql` 채워나감.
자세히는 [docs/guidelines/module-development.md](docs/guidelines/module-development.md).

## 빌드 / 실행 / 검증

```bash
pnpm install
pnpm dev          # turbo dev (모든 패키지 병렬)
pnpm build        # 프로덕션 빌드
pnpm typecheck    # 모든 패키지 tsc --noEmit
pnpm test         # vitest run (24 골든패스 테스트)
pnpm format       # prettier
pnpm eslint
pnpm syncpack:check
```

## 패키지 구조

```
apps/
  web/                         React Router 7 진입점

packages/
  core, auth, admin            인프라 (모듈 시스템, 인증, 어드민 패널)
  ui, ui-admin                 공개/관리자 UI 컴포넌트
  layout-default, layout-admin 사이트 레이아웃
  database                     Prisma + 마이그레이션
  env                          환경 변수 typed export
  schema                       공용 zod 필드 (sign-up / mypage 공유)
  config-typescript            tsconfig base
  layout-example, module-example 새 패키지/모듈 작성용 레퍼런스

  module-board                 게시판
  module-editor                위지위그 (TipTap)
  module-file                  파일 업로드
  module-newsletter            뉴스레터
  module-sms                   SMS / 카카오 알림톡
```

각 패키지의 역할/공개 API/의존 관계: [packages/INDEX.md](packages/INDEX.md).

## 환경

- OS: Windows 11 (PowerShell 또는 git-bash)
- 패키지 매니저: pnpm 9.x (`only-allow pnpm`)
- Node: `>=22`

> Windows bash 에서 명령 체이닝은 `&&` 대신 `;` 또는 줄바꿈 사용.
