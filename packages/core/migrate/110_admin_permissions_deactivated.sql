-- core.admin_permissions 에 `deactivated_at` 컬럼 추가.
--
-- ModuleManager.syncWithDatabase() 가 활성 모듈이 더 이상 선언하지 않는 권한
-- (=비활성 모듈이거나 모듈에서 삭제된 권한) 을 deactivated_at = now() 로 마킹.
-- 권한 행 자체는 보존 — `admin_role_permissions` 매핑이 끊기지 않도록.
-- 모듈을 다시 켜면 syncModule 이 upsert + deactivated_at = NULL 로 복구.
--
-- 권한 화면 UI 에서는 deactivated 항목을 별도 섹션으로 보여주거나 회색 처리.

ALTER TABLE core.admin_permissions
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS admin_permissions_active_idx
  ON core.admin_permissions (name)
  WHERE deactivated_at IS NULL;
