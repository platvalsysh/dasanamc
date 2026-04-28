# 모듈 개발 가이드

새 기능 모듈을 만들 때 따라야 할 단계별 절차.

## 결정: 새 모듈로 만들 것인가?

| 상황 | 권장 |
|---|---|
| 자체 라우트 + 자체 권한 + 자체 DB 테이블 | **새 모듈** |
| 기존 모듈에 작은 기능 추가 | 기존 모듈 안에 |
| 여러 모듈에서 공유될 유틸/타입 | `@repo/core` 또는 `@repo/shared-*` |
| UI 컴포넌트만 | `@repo/ui` 또는 `@repo/ui-admin` |

## 자동 스캐폴드

```bash
pnpm new:module <name>
```

이 명령이 [packages/module-example](../../packages/module-example/) 을 복제하여 `packages/module-<name>/` 생성. 이름/경로/권한 키 자동 치환. 스크립트: [scripts/new-module.mjs](../../scripts/new-module.mjs).

## 수동 단계 (자동 후 또는 직접)

### 1. 모듈 정의 ([src/module.server.ts](../../packages/module-example/src/module.server.ts))

```ts
export const module = createModule("<name>")
  .routes({ public, admin, api })
  .permissions([
    { name: "<name>.list",   display_name: "목록 조회" },
    { name: "<name>.create", display_name: "생성" },
    { name: "<name>.delete", display_name: "삭제", is_dangerous: true },
  ])
  .roles([
    { name: "ROLE_<NAME>_EDITOR", display_name: "Editor", permission_names: ["<name>.create"] },
  ])
  .adminMenuItemUnits([
    { id: "<name>-list", label: "...", icon: "...", path: "/admin/<name>", permission: "<name>.list" },
  ])
  .build();
```

### 2. 라우트 ([src/routes.server.ts](../../packages/module-example/src/routes.server.ts))

```ts
export const routesPublic = [
  route("/<name>", "public/index/page.tsx"),
] satisfies RouteConfig;

export const routesAdmin = [
  route("/admin/<name>", "admin/index/page.tsx"),
  route("/admin/<name>/list", "admin/list/page.tsx"),
] satisfies RouteConfig;

export const routesApi = [
  route("/api/<name>/list", "api/list.ts"),
  route("/api/<name>/create", "api/create.ts"),
  // ...
] satisfies RouteConfig;
```

### 3. DB 스키마 (필요시)

`packages/module-<name>/migrate/001_init.sql` 작성.

```sql
CREATE TABLE IF NOT EXISTS <name>_items (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

그 후:

```bash
pnpm db:migrate    # 마이그레이션 적용
pnpm db:pull       # Prisma 스키마를 DB에서 역으로 끌어옴
pnpm db:gen        # Prisma 클라이언트 생성
```

> **`packages/database/prisma/schema.prisma` 직접 수정 금지.** SQL 이 source of truth.

### 4. API 액션 ([src/api/](../../packages/module-example/src/api/))

```ts
// src/api/list.ts
import { JsonResponse } from "@repo/core/server";
import { prisma } from "@repo/database";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const pageSize = 20;

  const [items, totalCounts] = await Promise.all([
    prisma.<name>_items.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
    prisma.<name>_items.count(),
  ]);

  return JsonResponse.paging({
    data: items,
    totalCounts,
    totalPages: Math.ceil(totalCounts / pageSize),
  });
}
```

### 5. 페이지 ([src/admin/list/page.tsx](../../packages/module-example/src/admin/list/page.tsx))

```tsx
import { useLoaderData } from "react-router";

export const loader = async () => {
  const items = await prisma.<name>_items.findMany();
  return { items };
};

export default function List() {
  const { items } = useLoaderData<typeof loader>();
  return <div>{items.map(i => <div key={i.id}>{i.title}</div>)}</div>;
}
```

### 6. 앱에 등록

```ts
// apps/web/app/modules.server.ts
import { module as <name> } from "@repo/module-<name>/module";

export const modules = [..., <name>];
```

### 7. 검증

```bash
pnpm install
pnpm typecheck
pnpm dev
```

DB 권한이 코드와 동기화되도록 앱 부팅 시 `moduleManager.syncWithDatabase()` 가 자동 실행됨.

## 체크리스트

- [ ] `package.json` `name` 이 `@repo/module-<new>`
- [ ] `module.server.ts` 의 `createModule("<new>")`
- [ ] 권한 이름이 `<new>.*` 형식
- [ ] 라우트 경로가 `/<new>` 또는 `/admin/<new>` 또는 `/api/<new>`
- [ ] [apps/web/app/modules.server.ts](../../apps/web/app/modules.server.ts) 의 `modules` 배열에 추가
- [ ] DB 변경이 있다면 `migrate/*.sql` 작성, Prisma 스키마 직접 수정 안 함
- [ ] `pnpm typecheck` 통과
- [ ] `pnpm dev` 에서 라우트 접근 확인
- [ ] 권한이 `/admin/system/settings/menu` 의 메뉴 빌더에 노출됨
