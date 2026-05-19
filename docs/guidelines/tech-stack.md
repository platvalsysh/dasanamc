# 기술 스택 (Technology Stack)

## 런타임 / 빌드

- **언어**: TypeScript (strict, ESM)
- **Node**: `>=22`
- **패키지 매니저**: **pnpm 9.x** (`preinstall: only-allow pnpm` 으로 강제)
- **모노레포**: pnpm workspace + [Turborepo](https://turborepo.com/) (캐싱/병렬 빌드)
- **번들러**: [Vite](https://vitejs.dev/) (SSR)

## 프레임워크 / UI

- **프레임워크**: [React Router v7](https://reactrouter.com/) (Framework mode, SSR)
- **UI 라이브러리**: [React 19](https://react.dev/)
- **컴포넌트**: 자체 패키지 — `@repo/ui` (공개), `@repo/ui-admin` (관리자, [Radix UI](https://www.radix-ui.com/) 기반)
- **스타일링**: [Tailwind CSS v4](https://tailwindcss.com/) + `clsx` + `tailwind-merge`
- **아이콘**: [lucide-react](https://lucide.dev/) 표준

## 데이터

- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (Auth + Postgres 17 + Storage)
- **ORM**: [Prisma 7](https://www.prisma.io/) — 단, **SQL 마이그레이션 → `prisma db pull` → 클라이언트 생성** 방식. `schema.prisma` 직접 수정 금지. 자세히 [database-migration.md](./database-migration.md)
- **폼 검증**: [Zod](https://zod.dev/)

## 인증 / 시크릿

- Supabase Auth (이메일/비밀번호, 휴대폰 OTP via Kakao 알림톡)
- 비밀번호 해시: `bcrypt`
- 권한 모델: Role-Permission 매핑, JWT custom claim hook 으로 `roles` 주입

## 테스트

- [Vitest](https://vitest.dev/) (유닛/통합) — 골든패스 3종 운영 중. 자세히 [testing.md](./testing.md)

## 배포

- [Vercel](https://vercel.com/) 권장 (`pnpm build`)
- 환경변수는 [turbo.json](../../turbo.json) 의 `globalEnv` 등록 후 Vercel 대시보드 입력
