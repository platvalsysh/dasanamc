# CLAUDE.md — AI 에이전트 진입점

이 저장소의 AI 에이전트(Claude Code) 단일 진입점. 운영 규칙 + 작업 지도 +
외주 시작 절차가 모두 여기에 있다.

## 한 줄 요약

React Router 7 + pnpm 9 + Turborepo + Supabase Postgres 로 만든 **모듈식
홈페이지 템플릿** (`dasanamc`, chemeng 프로젝트 스냅샷에서 분기). 외주
프로젝트마다 [packages/module-*](packages/) 를 골라 끼워 쓴다.

## 응답 / 작업 규칙

- **모든 답변 한국어**
- **셸 명령 체이닝 금지** (`&&` 사용 X). 이 템플릿은 Windows 11 PowerShell
  지원이 1차 목표라 `&&` 가 안 먹는다. 한 줄에 묶을 땐 `;` 로, 가급적이면
  명령을 줄로 분리. (macOS/Linux 에서도 `;` 는 동작)
- **`schema.prisma` 직접 수정 금지**. 변경은 항상 `packages/{모듈}/migrate/*.sql`
  로 작성 후 `pnpm db:migrate` → `pnpm db:pull` → `pnpm db:gen`
- **빌드 도구를 `devDependencies` 에 두지 말 것**. Vercel `pnpm install --prod`
  시 누락되어 빌드 깨짐. `typescript`, `turbo`, `vite`, Tailwind 플러그인
  등 모두 `dependencies` 에. catalog 사용시 `pnpm-workspace.yaml` 의
  `catalog:` 를 통해 버전 통일
- **모듈 간 직접 import 금지** (`@repo/module-board` 가 `@repo/module-editor`
  부르는 식). 공통은 `@repo/core` 또는 새 `@repo/shared-*` 로 승격
- **시크릿/토큰을 React `useState` 에 저장 금지** (XSS 위험). hidden input
  또는 httpOnly 쿠키 사용
- **`git commit` / `git push` 는 사용자의 명시적 요청 시에만** ("커밋해줘",
  "푸시해줘" 등). 평소엔 로컬 수정 + 검증까지만
- **자세한 컨벤션은 주제별 가이드** — [docs/guidelines/](docs/guidelines/) 참고

## 진입 순서 (작업 시작 전)

1. 이 파일 (CLAUDE.md)
2. [packages/INDEX.md](packages/INDEX.md) — 패키지 매트릭스
3. [docs/guidelines/](docs/guidelines/) — 주제별 컨벤션
4. [packages/core/README.md](packages/core/README.md) — 모듈 시스템 동작 원리

## 자주 하는 작업

| 작업 | 시작 위치 |
|---|---|
| 새 모듈 만들기 | `pnpm new:module <이름>` 후 [docs/guidelines/module-development.md](docs/guidelines/module-development.md) |
| 라우트 추가 | 해당 모듈의 `src/routes.server.ts` |
| 권한 추가 | 해당 모듈의 `src/module.server.ts` 의 `.permissions([...])` |
| 폼 작성 | [docs/guidelines/form-handling.md](docs/guidelines/form-handling.md) |
| 에러 처리 | [docs/guidelines/error-handling.md](docs/guidelines/error-handling.md) |
| 상태 어디 둘지 | [docs/guidelines/state-management.md](docs/guidelines/state-management.md) |
| 다국어 | [docs/guidelines/i18n.md](docs/guidelines/i18n.md) |
| UI/디자인 작업 | [design-system/dasanamc/MASTER.md](design-system/dasanamc/MASTER.md) — 색 토큰·타이포·radius·접근성 기준선 (원본은 `apps/web/app/app.css` `@theme`) |
| DB 스키마 변경 | **`schema.prisma` 직접 수정 금지**. `packages/{모듈}/migrate/*.sql` 작성 후 `pnpm db:migrate` → `pnpm db:pull` → `pnpm db:gen` |
| 새 마이그레이션 idempotent 작성 | `packages/core/migrate/000_init.sql` 패턴 참고 (`CREATE ... IF NOT EXISTS` + `DO $$ pg_constraint 체크 $$`) |

## 셸 / 플랫폼

- 1차 OS: **Windows 11** (PowerShell 또는 git-bash). macOS/Linux 도 정상 동작
- 패키지 매니저: **pnpm 9.x** (`only-allow pnpm` 강제)
- Node: `>=22`
- 명령 체이닝은 `;` 만 (`&&` 금지 — Windows PowerShell 비호환)

## 빌드 / 실행

```bash
pnpm install
pnpm dev          # turbo dev (모든 패키지 병렬)
pnpm typecheck
pnpm test
pnpm format
pnpm syncpack:check
pnpm build
```

DB 관련:
```bash
pnpm db:migrate                          # SQL 마이그레이션 + db:pull + db:gen
pnpm --filter @repo/database exec tsx scripts/migrate.ts   # 마이그레이션만 (Prisma 재생성 스킵)
pnpm --filter web db:init-permissions    # 권한/역할/매핑 시드
pnpm --filter web db:bootstrap-admin -- --email <e> --password <p> --display-name <n>
pnpm new:module <이름>                    # 신규 모듈 스캐폴드
```

## 외주 프로젝트 시작 절차 (체크리스트)

1. **저장소** — 이 리포 복제 → 새 리모트 연결
2. **환경 변수** — `.env.example` → `.env` 복사 후 채움. 클라이언트별 Supabase
   프로젝트의 URL/anon/service_role/DB URL/pooler 호스트 입력. `AUTH_SECRET`
   은 휴대폰 인증 HMAC 키로 **반드시 16자 이상** (`openssl rand -hex 32`).
   `ENABLED_MODULES` 로 사용할 모듈만 활성화 (예: `ENABLED_MODULES=board,file`).
   `core`/`auth`/`admin` 은 화이트리스트 무관 항상 활성. 자세히는 [README.md](README.md) §2
3. **DB 스키마 + 시드 + 초기 관리자**
   ```bash
   pnpm db:migrate
   pnpm --filter web db:init-permissions
   pnpm --filter web db:bootstrap-admin -- --email admin@... --password ... --display-name "..."
   ```
4. **Supabase Auth JWT Hook 활성화** (Cloud 프로젝트 설정이라 SQL 자동화 불가, 1회 수동)
   Dashboard → Authentication → Hooks → "Customize Access Token (JWT) Claims"
   → Postgres / schema `public` / function `custom_access_token_hook` → Enable → Save.
   기존 세션은 구 JWT 사용 중이므로 **로그아웃 → 재로그인** 필요
5. **모듈 정리** (선택) — 영원히 안 쓸 모듈은 `packages/module-*/` 디렉토리째
   삭제 가능. 그 전에 `apps/web/app/modules.server.ts` 와 `apps/web/package.json`
   의 의존 제거. 이전 사례: `module-newsletter` 제거 커밋 참고
6. **브랜딩** — **모두 `apps/web` 안에서만**:
   - `apps/web/app/components/site/` — 헤더/푸터/QuickBar/ScrollEffects (외주 전용 콘텐츠)
   - `apps/web/app/components/` — 그 외 홈페이지 섹션 컴포넌트
   - `apps/web/app/routes/home.tsx`, `routes/about/`, `routes/centers.tsx` 등 — 외주별 페이지
   - `apps/web/app/data/` — 외주 콘텐츠 데이터
   - `apps/web/app/app.css` — 디자인 토큰
   - 헤더 메뉴 기본값은 **헤더 컴포넌트의 `MENU_ITEMS_FALLBACK`** 안에서만 정의
     (`packages/core/src/.server/site-menu.ts` 의 `DEFAULT_HEADER_MENU` 는 빈 배열)
   - DB `core.configs.siteMenu_header` 가 source of truth — 운영 중에는 admin
     메뉴 빌더(`/admin/menu`)로 관리
7. **검증** — `pnpm typecheck` / `pnpm test` / `pnpm syncpack:check` / `pnpm build`
8. **배포** — Vercel 권장. `turbo.json` 의 `globalEnv` 에 새 환경변수 등록

## 절대 하지 말 것 (요약)

- `schema.prisma` 직접 수정
- 빌드 도구를 `devDependencies` 에 추가
- 모듈 간 직접 import (`@repo/module-A` → `@repo/module-B`)
- 시크릿/토큰을 `useState` 에 저장
- 셸에서 `&&` 체이닝
- 이미 적용된 마이그레이션 파일 수정 (재실행이 안 됨 — 새 파일 추가로 변경)

## 출처

이 템플릿은 chemeng 프로젝트의 스냅샷에서 분기. 시작 시점은 `git log --oneline`
으로 확인. chemeng 도메인 잔재(bxmember, organization, schedule, sponsors,
newsletter)는 단계적으로 제거 완료.
