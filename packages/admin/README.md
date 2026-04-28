# @repo/admin

관리자 패널의 시스템 페이지를 담는 모듈. 메뉴/사이트메뉴 빌더, 설치된 모듈 조회, 일반 설정 등 _개별 기능 모듈에 속하지 않는_ 어드민 화면을 모아둔다.

## 진입점

```ts
import { module as admin } from "@repo/admin/module";
```

`apps/web/app/modules.server.ts` 의 `allModules` 에 포함. `ENABLED_MODULES` 화이트리스트와 무관하게 항상 활성 (ALWAYS_ON).

## 주요 라우트

- `/admin` — 대시보드
- `/admin/system/settings/menu` — 관리자 메뉴 빌더
- `/admin/system/settings/site-menu` — 공개 사이트 메뉴 빌더
- `/admin/system/settings/installed-modules` — 등록된 모듈 인벤토리
- `/admin/system/settings/general` — 사이트 전반 설정

## 의존성

- `@repo/auth` — 권한 가드 (`auth.admin.access`)
- `@repo/core` — `moduleManager.getAdminMenuItemUnits()` 로 모든 모듈의 메뉴 후보 수집
- `@repo/ui-admin` — Table/Dialog 등 어드민 UI
- `@dnd-kit/*` — 메뉴 드래그앤드롭

## 메뉴 빌더 동작

각 기능 모듈이 `module.adminMenuItemUnits([...])` 로 _후보 항목_ 을 export. 관리자가 빌더에서 골라 `admin_menu_config` 테이블에 저장. 런타임에는 DB 설정 + 코드 후보 매칭으로 최종 메뉴 렌더링.
