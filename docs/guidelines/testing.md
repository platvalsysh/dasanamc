# 테스트 가이드

> **현재 상태**: vitest 설치 완료, 골든패스 3종 (`phone-verify`, `JsonResponse`, `ModuleBuilder`) 운영 중. UI/통합/E2E 는 미도입.

## 실행

```bash
pnpm test          # 1회 실행
pnpm test:watch    # watch 모드
```

설정은 루트 [vitest.config.ts](../../vitest.config.ts) 에서 관리. 테스트 파일은 `packages/*/test/**/*.test.ts` 패턴으로 자동 수집.

`AUTH_SECRET` 환경변수는 `phone-verify` 가 모듈 로드 시점에 검증하므로,
미설정 환경에서 테스트가 깨지지 않도록 `vitest.config.ts` 가 fallback 값을 주입.
실제 `.env` 의 `AUTH_SECRET` 가 있으면 그대로 사용.

## 권장 스택

- **유닛/통합**: [Vitest](https://vitest.dev) ✅ 설치 완료
- **E2E**: [Playwright](https://playwright.dev) — 미도입
- **컴포넌트**: Vitest + `@testing-library/react` — 미도입

## 추가 도입이 필요할 때

UI/컴포넌트 테스트가 필요해지면:

```bash
pnpm add -Dw @testing-library/react @testing-library/jest-dom jsdom
```

루트 `vitest.config.ts` 에 `environment: "jsdom"` 옵션 추가.

## 골든패스 (외주 회귀 방지)

현재 운영 중:

| 시나리오 | 위치 |
|---|---|
| 휴대폰 인증 토큰 발급/검증/위조 | [packages/auth/test/phone-verify.test.ts](../../packages/auth/test/phone-verify.test.ts) |
| API JsonResponse 응답 형식 | [packages/core/test/JsonResponse.test.ts](../../packages/core/test/JsonResponse.test.ts) |
| 모듈 빌더 권한/역할/라우트 체이닝 | [packages/core/test/ModuleBuilder.test.ts](../../packages/core/test/ModuleBuilder.test.ts) |

추가 권장 (미도입):

| 시나리오 | 위치 (예시) |
|---|---|
| 로그인 액션 | `packages/auth/test/login.test.ts` |
| 권한 가드 미들웨어 | `packages/core/test/middleware.test.ts` |
| 모듈 등록 → 라우트 합성 | `packages/core/test/ModuleManager.test.ts` (prisma mock 필요) |

## 테스트 파일 명명

- 유닛: `packages/{패키지}/test/*.test.ts` (소스와 디렉토리 분리)
- E2E: `e2e/*.spec.ts` (루트, 미도입)

## 우선순위 — 어떤 코드를 먼저 테스트할 것인가

1. **외주에서 자주 변형되지만 깨지면 곤란한 곳** — 모듈 등록, 권한, 메뉴 빌더
2. **DB와 직접 닿는 서버 함수** — `packages/*/src/.server/*.ts`
3. **돈/보안과 닿는 액션** — 결제, 인증, 권한 변경

## 안티 패턴

- ❌ 모든 함수에 100% 커버리지 강제 — 의미 없는 mocking 양산
- ❌ DB를 mock — `prisma` 자체가 인터페이스이므로 in-memory SQLite 또는 테스트 DB 사용 권장
- ❌ 통합 테스트에서 외부 API 호출 — VCR(녹화) 또는 명시적 stub
