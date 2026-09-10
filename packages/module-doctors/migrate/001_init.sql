-- 의료진 (doctors) 모듈 — 병원 의료진 프로필 테이블
--
-- 하드코딩되어 있던 apps/web/app/data/dasanone-content.ts 의 DOCTORS /
-- DOCTOR_DETAILS / CENTER_DOCTORS 를 DB 로 옮긴다. 단일 병원 사이트라
-- core.modules(mid) 스코프 없이 전역 테이블 하나로 관리.

CREATE SCHEMA IF NOT EXISTS modules;

CREATE TABLE IF NOT EXISTS modules.doctors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          character varying(50)  NOT NULL,                 -- 이름
  title         character varying(100) NOT NULL,                 -- 직책 (예: 대표원장 · 외과)
  cred          text                   NOT NULL DEFAULT '',      -- 약력 한 줄 요약
  quote         text                   NOT NULL DEFAULT '',      -- 진료 철학 인용구
  greeting      text                   NOT NULL DEFAULT '',      -- 인사말
  career        jsonb                  NOT NULL DEFAULT '[]'::jsonb, -- 전체 약력 (string[])
  centers       jsonb                  NOT NULL DEFAULT '[]'::jsonb, -- 담당 센터 id (string[])
  photo_file_id uuid,                                            -- 업로드 사진 (modules.files)
  photo_url     text,                                            -- 정적/외부 사진 URL (fallback)
  is_chief      boolean                NOT NULL DEFAULT false,   -- 대표원장 여부
  is_active     boolean                NOT NULL DEFAULT true,    -- 사이트 노출 여부
  list_order    integer                NOT NULL DEFAULT 0,       -- 정렬 (작을수록 위)
  created_at    timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at    timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS doctors_list_order_idx
  ON modules.doctors USING btree (list_order);

CREATE INDEX IF NOT EXISTS doctors_active_order_idx
  ON modules.doctors USING btree (list_order) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS doctors_photo_file_id_idx
  ON modules.doctors USING btree (photo_file_id);

-- 사진 파일 FK — 파일이 지워지면 NULL 로 (프로필은 유지)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_photo_file_id_fkey') THEN
    ALTER TABLE modules.doctors
      ADD CONSTRAINT doctors_photo_file_id_fkey
      FOREIGN KEY (photo_file_id) REFERENCES modules.files(id)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

-- updated_at 자동 갱신 (core/099 의 공용 트리거 함수 재사용)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_doctors_updated_at'
  ) THEN
    CREATE TRIGGER update_doctors_updated_at
      BEFORE UPDATE ON modules.doctors
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
