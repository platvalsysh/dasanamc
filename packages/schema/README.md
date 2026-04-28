# @repo/schema

화면 간에 공유되는 zod 필드 스키마. sign-up, mypage, 관리자 사용자 편집 등이 모두 같은 검증 규칙을 쓰도록 단일 정의를 제공.

## 사용

```ts
import {
  emailSchema,
  passwordSchema,
  passwordStrongSchema,
  personalFields,
  allEducationFields,
  officeFields,
  settingsFields,
  yesNoSchema,
  refineAtLeastOneDegree,
} from "@repo/schema";
import { z } from "zod";

// 화면별로 필요한 필드만 골라 합성
const SignUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  ...personalFields,
  ...allEducationFields,
});
```

## 분류

| 카테고리 | export |
|---|---|
| 단일 필드 | `emailSchema`, `koreanNameSchema`, `displayNameSchema`, `sexSchema`, `phoneRequiredSchema`, `passwordSchema`(6자), `passwordStrongSchema`(8자), `yesNoSchema`(Y/N), `graduateMonthSchema` |
| 컴포지션 (펼쳐서 spread) | `personalFields`, `educationLevelFields`, `masterEducationFields`, `doctorEducationFields`, `allEducationFields`, `officeFields`, `settingsFields` |
| Refine 헬퍼 | `refineAtLeastOneDegree(schema)` — 학사/석사/박사 중 1개 이상 |

## 추가할 때

새로 공유해야 할 필드가 생기면:

1. `src/profile.ts` 또는 도메인별 새 파일에 export 추가
2. `src/index.ts` 가 자동 re-export
3. `test/` 에 케이스 1개 이상

화면 1곳에서만 쓰는 인라인 스키마는 굳이 옮기지 말 것 — 적어도 _2 곳 이상_ 공유될 때 이 패키지로 끌어올린다.
