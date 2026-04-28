# 테스트 가이드

> **현재 상태**: 테스트 인프라 미설치. 외주 사용 시 회귀 안전망 부재 — 본 문서는 도입 가이드.

## 권장 스택

- **유닛/통합**: [Vitest](https://vitest.dev) — Vite 친화, 모노레포에서 편함
- **E2E**: [Playwright](https://playwright.dev)
- **컴포넌트**: Vitest + `@testing-library/react`

## 도입 절차

### 1. 루트에 vitest 설치

```bash
pnpm add -Dw vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 2. 패키지별 vitest.config.ts

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
});
```

### 3. 골든패스 우선 (외주 회귀 방지)

| 시나리오 | 위치 |
|---|---|
| 로그인 액션 | `packages/auth/src/public/login/page.test.ts` |
| 회원가입 검증 | `packages/auth/src/public/sign-up/page.test.ts` |
| 모듈 등록 → 라우트 합성 | `packages/core/src/.server/ModuleManager.test.ts` |
| 권한 가드 미들웨어 | `packages/core/src/.server/middleware/*.test.ts` |
| API JsonResponse 형식 | `packages/core/src/.server/JsonResponse.test.ts` |

### 4. CI 통합

`turbo.json` 의 `pipeline` 에 `test` 추가:

```json
{
  "tasks": {
    "test": { "dependsOn": ["^build"], "outputs": [] }
  }
}
```

## 테스트 파일 명명

- 유닛: `*.test.ts` (구현체 옆)
- E2E: `e2e/*.spec.ts` (루트)

## 우선순위 — 어떤 코드를 먼저 테스트할 것인가

1. **외주에서 자주 변형되지만 깨지면 곤란한 곳** — 모듈 등록, 권한, 메뉴 빌더
2. **DB와 직접 닿는 서버 함수** — `packages/*/src/.server/*.ts`
3. **돈/보안과 닿는 액션** — 결제, 인증, 권한 변경

## 안티 패턴

- ❌ 모든 함수에 100% 커버리지 강제 — 의미 없는 mocking 양산
- ❌ DB를 mock — `prisma` 자체가 인터페이스이므로 in-memory SQLite 또는 테스트 DB 사용 권장
- ❌ 통합 테스트에서 외부 API 호출 — VCR(녹화) 또는 명시적 stub
