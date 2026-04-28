# @repo/auth

Supabase 기반 인증 + 휴대폰 SMS 인증 + 사용자/권한 관리 모듈.

## 진입점

```ts
import { module as auth } from "@repo/auth/module";
```

`apps/web/app/modules.server.ts` 의 `allModules` 배열에 끼우면 다음이 활성화된다:
- 공개 라우트: `/auth/login`, `/auth/sign-up`, `/auth/mypage`, `/auth/forgot-password`
- 관리자 라우트: `/admin/users`, `/admin/users/roles` 등
- 권한: `auth.users.view`, `auth.users.edit`, `auth.users.delete`, `auth.roles.manage` 등

## 주요 export

| export | 위치 | 용도 |
|---|---|---|
| `useAuthServerContext` | `./server` | 라우트 loader/action 에서 현재 사용자 조회 |
| `useSupabaseServerContext` | `./server` | Supabase 클라이언트 (요청 단위) |
| `signVerificationToken` 외 | `./server` | 휴대폰 인증 토큰 발급/검증 + httpOnly 쿠키 헬퍼 (sign-up / mypage 폰 변경에서 사용) |
| `useAuthBrowserContext` | `./ui` | 클라이언트 측 인증 상태 |

## 의존성

- `@repo/database` — `users`, `profiles`, `identifiers`, `admin_roles` 등
- `@repo/module-sms` — 휴대폰 인증번호 발송 (KakaoAlimtalk)
- `@repo/schema` — sign-up / mypage 폼 검증
- `@supabase/ssr`, `@supabase/supabase-js`, `bcrypt`

## 보안 메모

- 휴대폰 인증 토큰은 절대 React `useState` 또는 hidden input 으로 클라이언트에 노출하지 말 것. `_pv_token` / `_pv_verified` httpOnly 쿠키만 사용. `phone-verify.ts` 참고.
- 비밀번호 정책: sign-up 6자 이상, mypage 변경 시 8자 이상 (`@repo/schema/profile.ts` `passwordSchema` / `passwordStrongSchema`).
