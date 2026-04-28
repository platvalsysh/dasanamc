-- ============================================================================
-- Functions & Triggers 생성 (자동화 로직)
-- Description: 데이터 일관성과 자동화를 위한 함수 및 트리거 생성
-- 주의: 실제 DB와 동기화된 내용만 포함
-- ============================================================================

-- Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Profiles 테이블에 updated_at 트리거 추가
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON core.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 새 사용자 생성 시 프로필 자동 생성 함수 (user_roles는 admin만 수동 관리)
CREATE OR REPLACE FUNCTION public.handle_new_user_minimal()
RETURNS TRIGGER AS $$
DECLARE
  display_name_value text;
BEGIN
  -- display_name 추출
  display_name_value := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  -- profiles 테이블에 기본 프로필 생성
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
  
  -- admin 역할은 admin_user_roles 시스템으로 별도 관리
  -- 메타데이터 최소화는 custom_access_token_hook에서 처리
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Auth 사용자 생성 시 자동으로 프로필 생성 트리거
CREATE TRIGGER on_auth_user_created_minimal
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_minimal();

-- ============================================================================
-- 주의: 다음 함수는 실제 DB에서 직접 관리되며 마이그레이션에는 포함되지 않음:
-- - custom_access_token_hook() : 액세스 토큰 훅
-- ============================================================================