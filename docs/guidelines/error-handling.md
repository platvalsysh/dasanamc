# 에러 핸들링

## 3개 레이어

| 레이어 | 위치 | 도구 |
|---|---|---|
| **API 응답** | `packages/*/src/api/*.ts`, action/loader | [JsonResponse.error()](../../packages/core/src/.server/JsonResponse.ts) |
| **라우트 ErrorBoundary** | 각 `page.tsx` 또는 layout | React Router `ErrorBoundary` named export |
| **앱 전역 폴백** | [apps/web/app/root.tsx](../../apps/web/app/root.tsx) | `Layout` + `ErrorBoundary` |

## 1. API 응답 (서버)

```ts
// packages/module-board/src/api/create.ts
import { JsonResponse } from "@repo/core/server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const parsed = CreateBoardSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) {
    return JsonResponse.error(parsed.error.issues[0].message, 400);
  }
  try {
    const board = await prisma.boards.create({ data: parsed.data });
    return JsonResponse.ok(board, 201);
  } catch (e) {
    console.error("[board.create]", e);
    return JsonResponse.error("서버 오류가 발생했습니다", 500);
  }
}
```

규칙:

- 사용자에게 보일 메시지는 **한국어**로
- **4xx** = 사용자 입력/권한 문제 (구체 메시지 OK)
- **5xx** = 시스템 문제 (내부 디테일은 로그로만, 사용자에게는 일반화된 메시지)
- 항상 `console.error` 로 컨텍스트 (`[모듈.액션]`) 남기기

## 2. 라우트 ErrorBoundary

```tsx
// 라우트 page.tsx
import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-8">
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
      </div>
    );
  }

  console.error(error);
  return <div className="p-8">예상치 못한 오류가 발생했습니다.</div>;
}
```

## 3. 앱 전역 (root.tsx)

[apps/web/app/root.tsx](../../apps/web/app/root.tsx) 에 이미 `Layout`과 최상위 `ErrorBoundary` 가 정의되어 있다. 라우트 단의 `ErrorBoundary` 가 없거나 throw 가 더 위로 올라오면 여기서 캐치.

## 절대 하지 말 것

- `try { ... } catch { /* 무시 */ }` — 최소한 `console.error`
- 사용자에게 스택 트레이스 노출
- 401/403 을 200 으로 위장 (모니터링/감사 로그가 깨짐)
- 모든 에러를 500 으로 통일 (4xx/5xx 분리해야 모니터링 의미 있음)
- 한국어 에러 메시지에 변수 보간 시 사용자 입력을 검증 없이 끼워넣기 (XSS)

## 유저-페이싱 메시지 표준

| 상황 | 메시지 |
|---|---|
| 입력 누락 | "필수 항목을 입력해주세요" |
| 형식 오류 | "올바른 {필드} 형식이 아닙니다" |
| 권한 없음 (401) | "로그인이 필요합니다" |
| 권한 없음 (403) | "접근 권한이 없습니다" |
| 자원 없음 (404) | "찾을 수 없습니다" |
| 충돌 (409) | "이미 존재합니다" |
| 시스템 (500) | "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요" |
