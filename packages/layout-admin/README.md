# @repo/layout-admin

관리자 페이지 레이아웃 (Sidebar / Header / Outlet).

## 사용

`apps/web/app/routes.ts`:

```ts
layout("./layouts/admin.tsx", [
  ...moduleManager.getRoutes("admin"),
]),
```

`./layouts/admin.tsx` 에서 `<AdminLayout>` 을 사용한다.

## 구성

- 사이드바: `moduleManager` 가 모은 메뉴 후보 + DB 의 `admin_menu_config` 머지 결과 렌더
- 헤더: 현재 관리자 정보, 로그아웃
- 권한 가드: 진입 시 `auth.admin.access` 체크. 미보유 시 `/auth/login?next=` 리디렉트
- 본문: `<Outlet />`

## 의존성

- `@repo/auth` — 관리자 권한 검증
- `@repo/core` — `moduleManager.getAdminMenuItemUnits()`
- `@repo/ui-admin` — Sidebar/Topbar UI
