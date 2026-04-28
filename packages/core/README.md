# @repo/core

모듈 시스템의 코어. 모든 기능 모듈은 이 패키지의 `createModule` DSL로 정의되고, `ModuleManager`로 등록된다.

## 공개 export 진입점

| 진입점 | 위치 | 용도 |
|---|---|---|
| `@repo/core/server` | [src/.server/index.ts](src/.server/index.ts) | 서버 전용 — `moduleManager`, `getAdminMenu`, `getSiteMenu`, `JsonResponse` |
| `@repo/core/module` | [src/module.server.ts](src/module.server.ts) | 코어 모듈 본체 (다른 모듈처럼 등록됨) |
| `@repo/core/types` | [src/types/index.ts](src/types/index.ts) | `Module`, `Permission`, `BaseModule`, `AdminMenuItemUnit` 등 |
| `@repo/core/ui` | [src/ui/index.ts](src/ui/index.ts) | `ClientOnly`, 아이콘 헬퍼, 사이트 메뉴 컨텍스트 |
| `@repo/core/utils` | [src/utils/index.ts](src/utils/index.ts) | `breadcrumbs`, `get-client-ip-address` |

## 모듈 정의 DSL

```ts
import { createModule } from "@repo/core/server";
import { type InferPermissionName } from "@repo/core/types";
import { routesAdmin, routesApi, routesPublic } from "./routes.server";

export const module = createModule("blog")
  .routes({ public: routesPublic, admin: routesAdmin, api: routesApi })
  .permissions([
    { name: "blog.list",   display_name: "목록 조회" },
    { name: "blog.create", display_name: "생성" },
    { name: "blog.delete", display_name: "삭제", is_dangerous: true },
  ])
  .roles([
    { name: "ROLE_BLOG_EDITOR", display_name: "Editor", permission_names: ["blog.create"] },
  ])
  .adminMenuItemUnits([
    { id: "blog-list", label: "Blog", icon: "newspaper", path: "/admin/blog", permission: "blog.list" },
  ])
  .build();

export type PermissionName = InferPermissionName<typeof module>;
```

권한 이름 형식은 타입으로 강제됨: `${ModuleName}.${소문자}` (`core` 모듈만 `*` 와일드카드 허용).

## ModuleManager

[src/.server/ModuleManager.ts](src/.server/ModuleManager.ts) 의 싱글톤 `moduleManager`.

| 메서드 | 용도 |
|---|---|
| `register(module \| modules[])` | 앱 부팅 시 1회. [apps/web/app/modules.server.ts](../../apps/web/app/modules.server.ts) 에서 호출 |
| `getRoutes("public" \| "admin" \| "api")` | React Router에 합칠 라우트 집계 |
| `getModules()` | 관리자 메뉴 빌더가 모듈 메타 표시할 때 |
| `getPermissions()` | 권한 카탈로그 |
| `syncWithDatabase()` | 코드의 권한/역할 정의를 DB와 동기화 (앱 부팅 시) |
| `isSystemRole(name)`, `isSystemPermission(name)` | 코드 정의된 시스템 권한/역할인지 체크 |

## JsonResponse

[src/.server/JsonResponse.ts](src/.server/JsonResponse.ts) — 모든 `api/*.ts` action/loader 표준 반환 형태.

```ts
return JsonResponse.ok({ items });                 // 200 + data
return JsonResponse.paging({ data: items, totalCounts: 100, totalPages: 5 });
return JsonResponse.error("권한이 없습니다", 403);
```

응답 스키마: `{ error: boolean, message: string | null, data: T }`. 페이징 시 `totalCounts`, `totalPages` 추가.

## 새 모듈 만들기

```bash
pnpm new:module <이름>
```

자세한 절차: [docs/guidelines/module-development.md](../../docs/guidelines/module-development.md).
