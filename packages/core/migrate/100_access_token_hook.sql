-- Custom Supabase Auth access token hook.
--
-- JWT claims에 `roles`, `display_name`, `profile_image` 을 주입한다.
-- AuthServerContext (packages/auth/src/.server/AuthServerContext.ts) 가
-- `claims.roles` 를 읽어 권한 체크하므로 이 hook 없이는 super_admin DB
-- 할당이 무용지물.
--
-- 멱등 — CREATE OR REPLACE FUNCTION + REVOKE/GRANT 모두 안전 재실행.
--
-- ⚠️ 이 함수가 만들어진다고 자동 호출되지는 않는다. Supabase Dashboard →
-- Authentication → Hooks → "Custom Access Token" 에서 이 함수를 선택해야
-- 활성화됨 (Cloud 프로젝트 설정이라 SQL 로 등록 불가).

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  claims jsonb;
  uid uuid;
  user_roles text[];
  user_display_name text;
  user_profile_image text;
BEGIN
  claims := event->'claims';
  uid := (event->>'user_id')::uuid;

  -- 활성 역할만 수집
  SELECT array_agg(r.name)
    INTO user_roles
  FROM core.admin_user_roles aur
  JOIN core.admin_roles r ON r.id = aur.role_id
  WHERE aur.user_id = uid
    AND aur.is_active = true
    AND (aur.expires_at IS NULL OR aur.expires_at > now())
    AND r.is_active = true;

  -- 프로필 기본 정보
  SELECT display_name, profile_image
    INTO user_display_name, user_profile_image
  FROM core.profiles
  WHERE user_id = uid;

  -- claims 주입
  claims := jsonb_set(claims, '{roles}', to_jsonb(COALESCE(user_roles, ARRAY[]::text[])));
  IF user_display_name IS NOT NULL THEN
    claims := jsonb_set(claims, '{display_name}', to_jsonb(user_display_name));
  END IF;
  IF user_profile_image IS NOT NULL THEN
    claims := jsonb_set(claims, '{profile_image}', to_jsonb(user_profile_image));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Supabase Auth 가 이 함수를 호출할 수 있도록 권한 부여
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;

-- hook 이 읽어야 할 테이블에 SELECT 권한
GRANT SELECT ON TABLE core.admin_user_roles TO supabase_auth_admin;
GRANT SELECT ON TABLE core.admin_roles TO supabase_auth_admin;
GRANT SELECT ON TABLE core.profiles TO supabase_auth_admin;
