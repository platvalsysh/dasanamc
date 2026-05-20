-- ============================================================================
-- Audit (2026-05-19) H8/H9 — FK 인덱스 + partial 인덱스 보강 (core 스키마)
--
-- - H8: FK 컬럼에 인덱스 없으면 부모 row 삭제/수정 시 자식 풀스캔.
--   admin_role_permissions.permission_id (UNIQUE (role_id, permission_id) 가
--   role_id 만 cover) / admin_user_roles.role_id, granted_by
-- - H9: custom_access_token_hook 이 JWT 발급마다
--   `WHERE user_id = ? AND is_active = true` 로 admin_user_roles 조회.
--   partial index 로 활성 row 만 좁히면 lookup 비용 최소화.
-- ============================================================================

-- H8: admin_role_permissions.permission_id
-- 기존 (role_id, permission_id) UNIQUE 는 role_id 만 leading 컬럼으로 cover.
-- permission 삭제/이름 변경 시 어떤 role 이 가졌는지 역방향 lookup 필요.
CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_permission_id
  ON core.admin_role_permissions (permission_id);

-- H8: admin_user_roles.role_id
-- 기존 (user_id, role_id) UNIQUE 는 user_id 만 leading. 역할 삭제/수정 시
-- 그 역할을 가진 user 를 찾는 쿼리에 인덱스 필요.
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_role_id
  ON core.admin_user_roles (role_id);

-- H8: admin_user_roles.granted_by
-- "이 관리자가 부여한 모든 역할" audit 쿼리. 빈 값이 많을 수 있어 partial.
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_granted_by
  ON core.admin_user_roles (granted_by)
  WHERE granted_by IS NOT NULL;

-- H9: admin_user_roles 의 활성 row 만 좁힌 partial 인덱스
-- custom_access_token_hook → 모든 JWT 발급마다 호출. is_active = false 행은
-- 보존만 하고 절대 조회 안 함. 활성 row 만 인덱싱하면 인덱스 크기 ↓, 캐시 ↑.
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_user_active
  ON core.admin_user_roles (user_id)
  WHERE is_active = true;
