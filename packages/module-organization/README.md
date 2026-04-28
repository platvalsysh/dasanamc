# @repo/module-organization

조직도 모듈. 부서/직급/구성원 트리.

## 진입점

```ts
import { module as organization } from "@repo/module-organization/module";
```

## 라우트

- 공개: `/organization` — 조직도 트리 표시
- 관리자: `/admin/organization` — 부서/직급 편집

## 의존성 (legacy)

⚠️ `@repo/module-sms` — 부서 단위 SMS 발송 (`OrganizationGroupSmsModal`).

## 데이터 모델

부서는 `parent_id` 로 트리 구성. 구성원은 `users` (Supabase Auth) 또는 외부 임포트 데이터 모두 매핑 가능.
