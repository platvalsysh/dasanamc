# 코딩 컨벤션 (Coding Conventions)

## 네이밍 (Naming)

- **파일**: `kebab-case.tsx` (예: `user-profile.tsx`).
- **컴포넌트**: `PascalCase` (예: `UserProfile`).
- **함수/변수**: `camelCase`.

## 컴포넌트 구조

```tsx
import { useState } from "react";
import { cn } from "@repo/ui/utils";

interface Props {
  className?: string;
}

export function ComponentName({ className }: Props) {
  return <div className={cn("base-styles", className)}>...</div>;
}
```

## CSS / Tailwind

- `clsx`와 `tailwind-merge` (`cn` 유틸리티)를 사용하여 클래스를 병합합니다.
- 임의의 값(예: `w-[123px]`) 사용을 지양하고 테마 토큰을 사용합니다.

## API 응답 (API Response)

- **모든 API 엔드포인트는 `JsonResponse`를 사용해야 합니다** (`react-router`의 `json()` 사용 금지).
- `JsonResponse`는 `@repo/core/server`에서 import합니다.
- 일관된 응답 형식을 제공하며, 에러 처리를 표준화합니다.

```tsx
import { JsonResponse } from "@repo/core/server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const data = {
      /* ... */
    };
    return JsonResponse.ok(data);
  } catch (error) {
    return JsonResponse.error("Error message", 500);
  }
}
```

**JsonResponse 메서드:**

- `JsonResponse.ok(data, status?, init?)` - 성공 응답
- `JsonResponse.paging({ data, totalCounts, totalPages }, status?, init?)` - 페이징 응답
- `JsonResponse.error(message, status?, init?)` - 에러 응답

## UI/UX 제한 사항 (UI/UX Constraints)

- **`window.confirm`, `window.prompt`, `window.alert` 사용 금지**: 기본 시스템 대화상자 대신 커스텀 모달이나 토스트 UI를 사용해야 합니다.

