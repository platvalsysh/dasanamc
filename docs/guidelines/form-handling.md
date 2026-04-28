# 표준 폼 핸들링 & 검증 (Standard Form Handling & Validation)

## 개요
이 프로젝트에서는 `@rvf/react-router` 대신 **React Router의 표준 `Form` API**와 **Zod**를 직접 사용하여 폼을 처리하고 검증합니다.
이 방식은 의존성을 줄이고, React Router의 기본 기능을 최대한 활용하며, 명시적인 데이터 흐름을 보장합니다.

## 핵심 원칙

1. **스키마 분리**: 검증 스키마는 컴포넌트 외부(예: `BoardSchemas.ts`)에 정의하여 클라이언트와 서버에서 재사용합니다.
2. **Server-Side Validation**: `action` 함수에서 `request.formData()`를 파싱하고 `safeParse()`로 검증합니다.
3. **Explicit Error Handling**: 검증 실패 시 `400 Bad Request`와 함께 구조화된 에러 객체를 반환합니다.
4. **Client-Side Feedback**: `useActionData`를 통해 서버에서 반환된 에러와 입력값을 UI에 표시합니다.

## 구현 패턴

### 1. 스키마 정의 (`BoardSchemas.ts`)

```typescript
import { z } from "zod";

export const BoardWriteSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  is_secret: z.boolean().optional(),
});
```

### 2. 서버 사이드 처리 (`action`)

`action` 함수에서는 `safeParse`를 사용하여 예외를 던지지 않고 우아하게 에러를 처리합니다.

```typescript
import { data, redirect, type ActionFunctionArgs } from "react-router";
import { BoardWriteSchema } from "./BoardSchemas";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // 체크박스 등의 처리를 위해 entries 변환 또는 개별 get 처리가 필요할 수 있음
  // 간단한 경우 Object.fromEntries 사용 (체크박스는 주의 필요)
  const values = Object.fromEntries(formData);
  
  // Zod 검증
  const result = BoardWriteSchema.safeParse(values);

  if (!result.success) {
    // flatten()으로 폼 필드별 에러 메시지 구조화
    const errors = result.error.flatten().fieldErrors;
    // 입력값(values)과 에러(errors)를 함께 반환하여 폼 상태 복원
    return data({ errors, values }, { status: 400 });
  }

  const { title, content } = result.data;
  
  // ... 비즈니스 로직 실행 ...

  return redirect("/success");
}
```

### 3. 클라이언트 사이드 UI (`Component`)

`useActionData`를 사용하여 서버 응답(에러, 이전 입력값)을 처리합니다.

```typescript
import { Form, useActionData, useNavigation } from "react-router";
import { action } from "./route"; // 같은 파일이라면 생략 가능

export default function WritePage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // 이전 입력값 복원 (서버에서 values를 반환해주므로)
  const defaultValues = actionData?.values || {
    title: "",
    content: "",
  };

  return (
    <Form method="post">
      {/* Global Error */}
      {actionData?.errors?.root && (
        <div className="error">{actionData.errors.root}</div>
      )}

      <div>
        <label>제목</label>
        <input 
          name="title" 
          defaultValue={defaultValues.title}
          className={actionData?.errors?.title ? "border-red-500" : ""}
        />
        {/* Field Error */}
        {actionData?.errors?.title && (
          <p className="text-red-500">{actionData.errors.title[0]}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "저장 중..." : "저장"}
      </button>
    </Form>
  );
}
```


## 4. `useActionData` vs `useFetcher` & API Routes

React Router는 폼 처리를 위해 두 가지 주요 훅을 제공합니다. 이 둘의 목적과 동작 방식이 다르므로 명확히 구분하여 사용해야 합니다.

### 비교

| 특징 | `useActionData` (Page Form) | `useFetcher` (Background Action) |
|------|-----------------------------|----------------------------------|
| **용도** | 페이지 전체 제출 (로그인, 글쓰기, 설정 저장) | 백그라운드 데이터 업데이트 (좋아요, 댓글 작성, 장바구니 담기) |
| **네비게이션** | 제출 후 URL 변경(`redirect`)이 주 목적 | 현재 페이지 유지, UI만 부분 업데이트 |
| **히스토리** | 브라우저 히스토리 스택에 추가됨 | 히스토리 스택에 영향 없음 |
| **UX** | 페이지 전환 또는 전체 리로드 느낌 | SPA처럼 부드러운 상호작용 |

### 권장 패턴: API 라우트 분리

`useFetcher`는 리다이렉트가 필요 없는 동작에 사용되므로, **페이지의 `action`과 섞어 쓰기보다 별도의 API 라우트(`routes/api/...`)로 분리하는 것**이 좋습니다.

#### 왜 분리해야 하나요?
1. **반환 타입 혼동 방지**: 
   - 페이지 `action`은 주로 `redirect`를 반환하거나 폼 에러(`data({ errors })`)를 반환합니다.
   - `fetcher.submit`을 처리하는 `action`은 주로 성공 여부(`json({ success: true })`)나 최신 데이터를 반환합니다.
   - 한 `action`에서 이 둘을 `intent`로 분기 처리하면 반환 타입이 복잡해지고(`Response | Json`), 클라이언트에서 타입 추론(`typeof action`)이 어려워집니다.
2. **코드 응집도**: UI 렌더링 로직이 없는 순수 데이터 처리(투표, 데이터 갱신)는 API 라우트로 관리하는 것이 깔끔합니다.

### 구현 예시

#### Bad (혼합 사용)
```typescript
// routes/board/$id.tsx
export async function action() {
  const intent = formData.get("intent");
  if (intent === "delete_post") return redirect("/board"); // Redirect
  if (intent === "vote") return json({ success: true, likes: 10 }); // JSON
  // 반환 타입이 섞여서 클라이언트에서 처리 곤란
}
```

#### Good (분리 사용)

**1. 페이지 폼 (`routes/board/write.tsx`)**
```typescript
// 리다이렉트가 필요한 "페이지 이동" 성격의 작업
export async function action() {
  // ... 검증 및 저장 ...
  return redirect("/board");
}

export default function WritePage() {
  // useActionData 사용
  return <Form method="post">...</Form>;
}
```

**2. 백그라운드 액션 (`routes/api/vote.tsx`)**
```typescript
// UI 없이 로직만 처리하는 API 라우트
export async function action({ request }: ActionFunctionArgs) {
  // ... 투표 로직 ...
  return data({ success: true, count: newCount });
}
```

**3. 클라이언트 사용 (`routes/board/$id.tsx`)**
```typescript
export default function ReadPage() {
  const fetcher = useFetcher<typeof apiVoteAction>(); // 타입 안전성 확보

  return (
    <fetcher.Form method="post" action="/api/vote">
      <input type="hidden" name="id" value={id} />
      <button type="submit">
        좋아요 {fetcher.data?.count ?? currentCount}
      </button>
    </fetcher.Form>
  );
}
```

## 주요 팁

- **체크박스 처리**: HTML 폼 전송 시 체크박스는 체크되지 않으면 값이 전송되지 않습니다. Zod preprocessing이나 `transform`을 사용하거나, `formData.get("field") === "on"`과 같이 수동으로 파싱하는 것이 안전합니다.
- **타입 안전성**: `useActionData<typeof action>`을 사용하여 `actionData`의 타입을 추론받으세요. API 라우트를 사용할 때도 `useFetcher<typeof apiAction>`으로 타입을 가져올 수 있습니다.

