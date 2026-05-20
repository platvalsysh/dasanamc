-- ============================================================================
-- Audit (2026-05-19) C7: 로그인 / SMS 발송 / 인증코드 검증의 rate limit 도입
--
-- 매우 단순한 이벤트 카운터 테이블. 키 + 시각만 저장하고 카운트는 SELECT 시
-- 시간 윈도우로 집계. Postgres 의 인덱스 검색 + 작은 데이터셋이라 충분.
-- ============================================================================

CREATE TABLE IF NOT EXISTS core.rate_limit_events (
  id          bigserial PRIMARY KEY,
  key         text NOT NULL,
  occurred_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 카운트 시 (key, occurred_at >= since) 조건을 자주 쓰므로 합성 인덱스
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_key_time
  ON core.rate_limit_events (key, occurred_at DESC);

-- 정리(GC) 보조 인덱스 — 오래된 row 삭제 시 사용
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_occurred_at
  ON core.rate_limit_events (occurred_at);

COMMENT ON TABLE core.rate_limit_events IS
  'audit C7 — login/SMS-send/verify-code 등의 rate limit 카운터. enforceRateLimit() 헬퍼가 INSERT + 카운트 조회.';
