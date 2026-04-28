# 상태 관리

React Router 7 환경에서 **"이 상태가 어디 살아야 하나"** 를 결정하는 가이드.

## 4개 영역

| 영역 | 도구 | 예 |
|---|---|---|
| **서버 데이터 (조회)** | `loader` + `useLoaderData` | 게시글 목록, 사용자 프로필 |
| **서버 데이터 (변경)** | `action` + `useActionData` 또는 `useFetcher` | 폼 제출, 삭제 |
| **UI 로컬** | `useState` | 모달 열림, 탭 인덱스, 입력값 임시 |
| **앱 전역 (UI)** | Context | 테마, 사이트 메뉴, 인증 정보 |

## 결정 트리

```
이 상태가 페이지 새로고침 후에도 같아야 하나?
├─ Yes → 서버 (DB)
│   ├─ 읽기만? → loader
│   └─ 쓰기? → action (폼) 또는 useFetcher (Optimistic UI)
└─ No → 클라이언트
    ├─ 한 컴포넌트만 사용? → useState
    ├─ 부모/자식 한정? → props
    └─ 앱 전체? → Context (남용 금지)
```

## 패턴별 상세

### loader → 화면

```tsx
export const loader = async () => {
  const items = await prisma.boards.findMany();
  return { items };
};

export default function List() {
  const { items } = useLoaderData<typeof loader>();
  // ...
}
```

### action → 폼 제출

```tsx
export const action = async ({ request }) => {
  const fd = await request.formData();
  const result = SchemaX.safeParse(Object.fromEntries(fd));
  if (!result.success) return { error: result.error.issues[0].message };
  await prisma.boards.create({ data: result.data });
  return { success: true };
};

export default function Create() {
  const result = useActionData<typeof action>();
  return (
    <Form method="post">
      <input name="title" />
      {result?.error && <p>{result.error}</p>}
      <button>저장</button>
    </Form>
  );
}
```

### useFetcher (현재 페이지를 떠나지 않고 쓰기)

```tsx
const fetcher = useFetcher();
fetcher.submit({ id }, { method: "post", action: "/api/board/delete" });
const isDeleting = fetcher.state !== "idle";
```

## TanStack Query 는?

이 프로젝트는 일부 위젯에서 TanStack Query 도입 중 (커밋 `9756bcb`, `abf0e91`).

- **언제 쓰나**: 같은 데이터를 여러 위젯이 polling/refetch 해야 하는 대시보드
- **언제 안 쓰나**: 한 페이지에서만 보는 데이터 — `loader` 가 충분

새 모듈 작성 시 기본은 loader/action. 정말 필요할 때만 TanStack 도입.

## 안티 패턴

- ❌ **서버 데이터를 useState 에 복제 후 useEffect 동기화** — `useLoaderData` 가 본질, 복제 무의미
- ❌ **토큰을 useState 에 보관** — XSS 위험. hidden input 또는 httpOnly 쿠키
- ❌ **모든 것에 Context** — 렌더 폭주, 디버깅 지옥. 트리 전체에서 정말 필요한 것만
- ❌ **action 결과를 별도 useState 로 다시 복제** — `useActionData()` 가 곧 결과
- ❌ **URL 에 살아도 되는 상태를 useState 로** (탭, 필터, 페이지) — `useSearchParams` 가 더 나음 (공유/뒤로가기 동작)
