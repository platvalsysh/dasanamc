# @repo/module-example

**새 모듈을 만들 때 복제할 참조 구현.** 비즈니스 로직은 비어있고 폴더 구조와 정형 패턴만 보여준다.

## 폴더 구조

```
packages/module-example/
  package.json              # exports: ./server, ./module
  tsconfig.json
  src/
    module.server.ts        # createModule().routes().permissions().build()
    routes.server.ts        # public / admin / api 라우트 선언
    .server/
      index.ts              # 서버 전용 비즈니스 로직 진입점
      server-config.ts
    public/                 # 공개 페이지 (loader/action + Component)
      index/page.tsx
    admin/                  # 관리자 페이지
      index/page.tsx
      list/page.tsx
      create/page.tsx
    api/                    # JSON API endpoint (loader = GET, action = POST)
      list.ts | create.ts | view.ts | edit.ts | delete.ts
      admin/
        list.ts | create.ts | view.ts | edit.ts | delete.ts
```

## 새 모듈로 복제

**자동:**
```bash
pnpm new:module <new-name>
```
스크립트: [scripts/new-module.mjs](../../scripts/new-module.mjs)

**수동 절차:**
1. `cp -r packages/module-example packages/module-<new>`
2. `package.json` 의 `name` → `@repo/module-<new>`
3. `module.server.ts` 의 `createModule("example")` → `createModule("<new>")`
4. 권한 이름 `example.*` → `<new>.*` 일괄 치환
5. `routes.server.ts` 의 `/example` 경로 → `/<new>` 일괄 치환
6. [apps/web/app/modules.server.ts](../../apps/web/app/modules.server.ts) 에 `import` 및 `modules` 배열 추가
7. `pnpm install` 후 `pnpm typecheck`

## 핵심 컨벤션

- **`.server.ts` 접미사 / `.server/` 디렉토리** — 클라이언트 번들에 포함되면 안 되는 코드. Vite/RR 빌더가 자동 트리 셰이크
- **`page.tsx`** — 라우트 컴포넌트 default export + `loader` / `action` named export
- **`api/*.ts`** — UI 없이 `loader`/`action`만 export, [JsonResponse](../core/src/.server/JsonResponse.ts) 사용
- **`admin/*` vs `api/admin/*`** — 전자는 페이지(HTML), 후자는 데이터(JSON)
