# 권한 시스템

이 프로젝트의 권한 모델, 선언 방법, 체크 패턴, 운영 워크플로를 한 곳에 정리. 새 모듈 만들 때 / 외주 시작 시 / 권한 디버깅 시 참고.

## 핵심 모델

```
모듈 선언 (createModule)
  ↓ moduleManager.syncWithDatabase()
core.admin_permissions    ─┐
                           ├─ admin_role_permissions ─┐
core.admin_roles          ─┘                          ├─ admin_user_roles ─→ auth.users
                                                      ┘
                           ↓ custom_access_token_hook
                           JWT claims.roles
                           ↓ AuthServerContext.makeBySupabase
                           Auth.checkPermissions / isSuperAdmin
```

핵심 원칙 **모듈 = 자기 권한·역할·메뉴의 단일 출처(SSOT)**.

- 모듈이 `createModule().permissions().roles().adminMenuItemUnits()` 로 선언
- `db:init-permissions` 가 ModuleManager 출처로 DB 시드 + 비활성 권한 deactivate
- DEFAULT_MENU_CONFIG / permissions.ts 하드코딩 시드는 폐기됨

## 권한 명명 규칙

- 형식: `{모듈명}.{소문자.단어}` (예: `board.list`, `auth.users.view`, `admin.settings.edit`)
- `core` 모듈만 `*` 와일드카드 허용 — 운영자 전권
- 각 모듈은 자기 와일드카드 `{모듈}.*` 선언 가능 (예: `board.*`)
- 검증: [packages/core/src/types/module.ts](../../packages/core/src/types/module.ts) 의 `ModuleValidPermissionKey` 타입이 컴파일 시점에 prefix 강제

와일드카드 평가:
- `userPermissions = ["board.*"]` → `board.create` 통과
- `userPermissions = ["*"]` → 모든 권한 통과 (super_admin)
- 구현: [packages/auth/src/utils/permission-check.ts](../../packages/auth/src/utils/permission-check.ts)

## 모듈에서 선언

```ts
// packages/module-board/src/module.server.ts
export const module = createModule("board")
  .routes({ public: routesPublic, admin: routesAdmin })
  .permissions([
    { name: "board.*",      display_name: "모든 권한", is_dangerous: true },
    { name: "board.list",   display_name: "게시판 목록 조회" },
    { name: "board.view",   display_name: "게시글 조회" },
    { name: "board.create", display_name: "게시글 작성" },
    { name: "board.edit",   display_name: "게시글 수정" },
    { name: "board.delete", display_name: "게시글 삭제", is_dangerous: true },
    { name: "board.admin.manage", display_name: "게시판 관리", is_dangerous: true },
  ])
  .roles([
    // 옵션: 모듈 전용 역할도 선언 가능
    // { name: "ROLE_BOARD_EDITOR", display_name: "Editor", permission_names: ["board.edit"] },
  ])
  .adminMenuItemUnits([
    {
      id: "board-admin",
      label: "게시판 관리",
      icon: "MessageSquare",
      path: "/admin/board",
      permission: "board.admin.manage",
      group: "콘텐츠",   // 사이드바에서 묶일 그룹 이름
      order: 10,         // 그룹 내 순서 (작을수록 위)
    },
  ])
  .build();
```

`group` 미지정 시 모듈 이름이 그룹. `order` 미지정 시 100. 자세한 규칙은 [packages/core/src/.server/ModuleManager.ts](../../packages/core/src/.server/ModuleManager.ts) 의 `getAdminMenuTree()` JSDoc.

## DB 시드 + 비활성 권한 정리

```bash
pnpm --filter web db:init-permissions
```

내부 동작 ([apps/web/scripts/init-permissions.ts](../../apps/web/scripts/init-permissions.ts) + `ModuleManager.syncWithDatabase`):

1. `modules.server.ts` 의 활성 모듈을 등록
2. 각 모듈의 권한·역할·역할-권한 매핑을 **upsert**
3. 활성 set 에 포함된 권한은 `deactivated_at = NULL` 로 복구
4. 활성 set 밖이고 아직 deactivate 안 된 권한은 `deactivated_at = now()` 마킹

**deactivate 의 의미**:
- 행 자체는 **삭제 안 함** — `admin_user_roles`/`admin_role_permissions` 매핑이 끊기지 않도록
- `auth/admin/roles` / `admin/installed-modules` 등 권한 화면은 활성 권한만 조회
- 다시 모듈을 켜면 자동 복구

ENABLED_MODULES 화이트리스트 변경 후 이 명령 한 번 돌리면 메뉴/권한이 자동 정합. 외주 시작 시 chemeng 잔재가 자동으로 deactivate 된 사례: 2026-05-19 dasanamc 셋업 시 32개 잔재 권한 자동 격리.

## JWT 클레임 주입 (Supabase Hook)

JWT 의 `claims.roles` 가 권한 체크의 입력. Supabase Auth 가 토큰 발급 시 `public.custom_access_token_hook(event)` 함수를 호출하여 claims 에 `roles` / `display_name` / `profile_image` 를 주입.

- SQL 정의: [packages/core/migrate/100_access_token_hook.sql](../../packages/core/migrate/100_access_token_hook.sql)
- 활성화: Supabase Dashboard → Authentication → Hooks → "Customize Access Token (JWT) Claims" → function `custom_access_token_hook` 선택 (자세한 절차는 [CLAUDE.md](../../CLAUDE.md) 외주 시작 절차 §3-a)

활성화 안 하면 DB 에 role 을 부여해도 JWT 에 반영되지 않아 권한 체크가 항상 실패. 절대 빠뜨리지 말 것.

## 권한 체크 패턴

### 서버 (loader / action)

```ts
import { useAuthServerContext } from "@repo/auth/server";

export async function loader({ context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);

  // 비로그인은 admin layout 이 /auth/login 으로 redirect 처리.
  // 권한 부족은 라우트 단위에서 즉시 403:
  auth.requirePermissions(["board.delete", "board.*"]); // OR 매칭 + 와일드카드

  // requireAll 옵션 — 모든 권한이 있어야 통과 (AND)
  auth.requirePermissions(["board.edit", "board.delete"], true);

  // super_admin 만 허용 (예: hard-delete 같은 위험 동작)
  auth.requireSuperAdmin();

  // 결과를 boolean 으로 받고 싶을 때 — UI 토글, fallback 등
  if (auth.checkPermissions(["board.delete"])) { ... }

  const user = auth.getUser();      // { id, email, display_name, profile_image }
  const roles = auth.getRoles();    // ["super_admin", ...]
}
```

`requirePermissions` / `requireSuperAdmin` 은 미충족 시 `Response(403)` 을 던져
React Router 가 그대로 응답으로 사용. 한 줄로 가드 표현이 끝나서 action 첫
줄에 두기 좋음. 단순 boolean 이 필요한 곳(UI 분기)은 `checkPermissions` 사용.

#### admin 설정 페이지용 헬퍼

`packages/admin/src/utils/admin-guard.ts` 에 settings/modules 가드 헬퍼 (요약):

```ts
requireSettingsView(context);  // loader 첫 줄  — admin.settings.view / admin.*
requireSettingsEdit(context);  // action 첫 줄 — admin.settings.edit / admin.*
requireModulesManage(context); // 모듈 인스턴스 관리 (admin.modules.manage)
```

### 클라이언트 (JSX)

```tsx
import { PermissionGate } from "@repo/auth/ui";

<PermissionGate permission="board.delete">
  <DeleteButton />
</PermissionGate>

<PermissionGate
  permission={["board.edit", "board.delete"]}
  requireAll={false}
  fallback={<p>권한이 없습니다</p>}
>
  ...
</PermissionGate>
```

내부적으로 `useCheckPermissions` 훅 → 같은 `checkUserPermissions` 로직 사용. SSR 시점에 loader 에서 받은 `permissions/roles` 가 React context 로 흐름.

### admin 가드 (3단계 defense-in-depth)

1. **레이아웃 진입**: `apps/web/app/layouts/admin.tsx` loader
   - 비로그인 → `/auth/login?redirectTo=...` redirect
   - 로그인은 했지만 **활성 모듈의 admin 메뉴 권한을 하나도 갖고 있지 않으면 403**
     (super_admin / admin.* 와일드카드 보유자는 통과). audit C1 의 backstop.
2. **각 라우트 loader / action**: `auth.requirePermissions([...])` 첫 줄 호출.
   - `loader` 는 보기 권한 (`admin.settings.view` 등)
   - `action` 은 변경 권한 (`admin.settings.edit`, `auth.users.delete` 등)
   - 위험 동작 (예: hard-delete, 역할 CRUD) 은 `auth.requireSuperAdmin()`
3. **UI 가드**: `<PermissionGate>` 로 버튼/메뉴 항목 숨김 — UX 보조

세 단계 모두 동일 `checkUserPermissions` 로직 (와일드카드 평가 포함).
한 곳이 뚫려도 다른 곳이 잡도록 중첩.

> **참고: SMS 모듈은 layout backstop 만**
> `@repo/module-sms ↔ @repo/auth` 순환의존을 피하기 위해 `packages/module-sms/src/admin/*`
> 의 loader/action 은 `useAuthServerContext` 직접 호출 안 함. 대신 admin layout
> 의 권한 backstop 이 차단. H6 (auth ↔ sms 역방향 의존 분리) 작업 시 함께 정리.

사이드바 메뉴 항목은 자체적으로 `permission` 필터링됨 (`PermissionGate permission={item.permission || []}`) — permission 미지정 항목은 누구나 보임. 권한 게이트가 필요한 메뉴는 모듈 선언에서 명시 권장.

## 메뉴 + 권한 연동

- 모듈이 메뉴 선언 시 `permission` 명시 → 사이드바 렌더링 시 권한 없는 항목 숨김
- `getAdminMenu()` 흐름 ([packages/core/src/.server/admin-menu.ts](../../packages/core/src/.server/admin-menu.ts)):
  1. DB 의 `site.adminMenu` config 가 비어있지 않으면 그것 (관리자가 메뉴 빌더로 커스터마이즈)
  2. 그 외에는 `moduleManager.getAdminMenuTree()` — 활성 모듈 선언 합성
- 관리자 메뉴 빌더 (`/admin/system/settings/menu`):
  - 모듈 선언과 매칭 안 되는 path 는 "활성 모듈에 없음" 빨간 배지 (dead-link)
  - "기본값으로 리셋" 버튼 → DB override 를 빈 배열로 저장 → declarative 트리로 복원
  - 사이트 메뉴(헤더/푸터) 빌더는 `/admin/menu` (별도)

## 역할 관리

- **시스템 역할** (모듈에서 선언) — `moduleManager.isSystemRole(name) === true`. UI 에서 삭제 불가
- **사용자 정의 역할** — admin UI 에서 임의 생성. 권한 매핑 자유

기본 시스템 역할 (core 모듈 선언):
- `super_admin` — 모든 권한 (`["*"]`)
- `moderator` — 기본 조회 권한

사용자에게 역할 부여:
- `/admin/users/assign-roles` UI 또는 직접 `admin_user_roles.upsert`
- bootstrap-admin 스크립트는 첫 super_admin 만 부여 (`pnpm --filter web db:bootstrap-admin -- --email ... --password ...`)

부여 후 효과는 **사용자가 재로그인** 해야 새 JWT 발급 → claims.roles 갱신 → 권한 체크 통과.

## 외주 시작 시 권한 정리 워크플로

1. `.env` 의 `ENABLED_MODULES=board,file,sms` 같이 사용할 모듈만 명시
2. `pnpm db:migrate` (`core/000_init.sql`, `100_access_token_hook.sql`, `110_admin_permissions_deactivated.sql` 자동 적용)
3. `pnpm --filter web db:init-permissions` — 활성 모듈 권한 시드 + 비활성 권한 자동 deactivate
4. Supabase Dashboard 에서 Custom Access Token Hook 활성화 (1회)
5. `pnpm --filter web db:bootstrap-admin -- --email ... --password ...` — 첫 super_admin
6. `/admin/system/settings/menu` 에서 dead-link 가 있으면 "기본값으로 리셋"

이 5분이 외주 권한 셋업 표준.

## 흔한 함정 / 안티패턴

- **권한 이름 변경 시 역할 매핑 끊김** — 옛 이름의 권한은 deactivate 되지만 `admin_role_permissions` 의 매핑은 옛 권한 id 를 가리킴. 새 이름 매핑은 syncWithDatabase 가 자동 추가하지만, 사용자가 만든 커스텀 역할에서는 수동 갱신 필요
- **JWT hook 누락** — DB 에 role 부여해도 JWT 에 안 박힘 → 권한 체크 항상 실패. Dashboard 활성화 확인
- **로그아웃-재로그인 안 하면 권한 갱신 안 됨** — JWT 캐시 1시간. 즉시 적용하려면 재로그인
- **admin POST action 의 권한 누락** — audit C1 의 본문. `auth.requirePermissions([...])` 한 줄을 각 action 첫 줄에 두는 게 표준. 2026-05-20 일괄 보강 완료 (settings 헬퍼 + 라우트별 가드 + admin layout backstop)
- **super_admin 의 `*` 가 모든 모듈을 우회** — 다른 역할은 명시적으로 `{모듈}.*` 부여
- **메뉴 빌더에서 저장하면 declarative 트리가 가려짐** — DB override 가 우선. 모듈 변경을 메뉴에 반영하려면 "기본값으로 리셋" 또는 빌더에서 직접 수정
- **moderator 역할의 권한 누락** — 현재 core 모듈에 `core.dashboard.view` 만 부여. 더 필요하면 모듈에서 추가 선언

## 관련 파일

- [packages/core/src/.server/ModuleManager.ts](../../packages/core/src/.server/ModuleManager.ts) — 모듈 등록 + sync + 트리 합성
- [packages/core/src/.server/module-builder.ts](../../packages/core/src/.server/module-builder.ts) — `createModule()` 빌더
- [packages/core/src/.server/admin-menu.ts](../../packages/core/src/.server/admin-menu.ts) — `getAdminMenu()` / `setAdminMenu()` / `resetAdminMenu()`
- [packages/core/src/types/module.ts](../../packages/core/src/types/module.ts) — `Permission` / `Role` / `AdminMenuItemUnit` 타입
- [packages/auth/src/.server/AuthServerContext.ts](../../packages/auth/src/.server/AuthServerContext.ts) — 권한 체크 진입점
- [packages/auth/src/ui/PermissionGate.tsx](../../packages/auth/src/ui/PermissionGate.tsx) — 클라이언트 게이트
- [packages/auth/src/utils/permission-check.ts](../../packages/auth/src/utils/permission-check.ts) — 와일드카드 매칭
- [packages/core/migrate/100_access_token_hook.sql](../../packages/core/migrate/100_access_token_hook.sql) — JWT claims 주입 함수
- [packages/core/migrate/110_admin_permissions_deactivated.sql](../../packages/core/migrate/110_admin_permissions_deactivated.sql) — deactivated_at 컬럼
- [apps/web/scripts/init-permissions.ts](../../apps/web/scripts/init-permissions.ts) — DB 시드 진입점
- [apps/web/scripts/bootstrap-admin.ts](../../apps/web/scripts/bootstrap-admin.ts) — 첫 super_admin 부트스트랩
