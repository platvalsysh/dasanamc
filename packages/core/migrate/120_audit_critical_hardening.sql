-- ============================================================================
-- Audit (2026-05-19) Critical 후속 조치
-- - C5: handle_new_user_minimal / update_updated_at_column 의 search_path 고정 +
--   SECURITY DEFINER 함수의 RPC 노출 차단 (REVOKE EXECUTE FROM authenticated/anon/public)
-- - C6: core.identifiers.identifier 에 UNIQUE 인덱스 추가 (로그인 ID 중복 방지)
-- ----------------------------------------------------------------------------
-- 멱등 패턴: CREATE OR REPLACE FUNCTION (함수) / IF NOT EXISTS (인덱스) /
--           DO $$ pg_constraint 체크 $$ (제약). 재실행해도 안전.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- C5-1. update_updated_at_column: search_path 고정
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- C5-2. handle_new_user_minimal: search_path 고정 + 스키마 한정
-- SECURITY DEFINER 함수가 search_path 를 신뢰하면 동일 이름의 객체를 임시
-- 스키마에 만들어 함수 동작을 가로챌 수 있음. 비워두고 모든 객체를 schema-qualified.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_minimal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  display_name_value text;
BEGIN
  display_name_value := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO core.profiles (
    user_id,
    display_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    display_name_value,
    NEW.created_at,
    NEW.updated_at
  );

  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- C5-3. SECURITY DEFINER 함수의 RPC 호출 권한 차단
-- 이 함수는 auth.users 의 트리거에서만 호출되어야 하며, anon / authenticated
-- 가 PostgREST 를 통해 직접 호출하지 못하게 EXECUTE 권한을 박탈.
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_user_minimal() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_minimal() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_minimal() FROM authenticated;

-- update_updated_at_column 도 일반 노출 불필요
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;

-- ----------------------------------------------------------------------------
-- C6. core.identifiers.identifier UNIQUE
-- 로그인 ID 컬럼. PK 가 user_id 만이라 동일 ID 가 여러 유저에 등록 가능.
-- 사전에 중복 행이 있으면 마이그레이션 실패하므로 먼저 정리해야 함.
-- 새 프로젝트는 깨끗하니 그냥 인덱스만 추가.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- 중복 데이터 검증 (있으면 명시적 에러로 차단 — 운영 환경 보호)
  IF EXISTS (
    SELECT 1 FROM core.identifiers
    GROUP BY identifier
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'core.identifiers.identifier 에 중복 값이 존재합니다. UNIQUE 인덱스를 만들 수 없습니다. 중복을 먼저 정리하세요.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_identifiers_identifier
  ON core.identifiers (identifier);
