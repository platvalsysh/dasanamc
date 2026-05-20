-- ============================================================================
-- Audit (2026-05-19) H8 — FK 인덱스 보강 (modules 스키마, board 영역)
--
-- - comments.parent_id : 스레디드 댓글의 부모 lookup. 댓글 삭제 시 자식 cascade
--   체크에도 사용. 기존엔 (document_id, head, arrange) 계층 인덱스만 있음
-- - document_ip_view_log.document_id : 문서별 IP 조회 카운트 / 문서 삭제 시
--   cascade 정리. 기존 (ip_address, document_id, created_at) 인덱스가 있으나
--   leading 컬럼이 ip_address 라 document_id 단독 lookup 에 활용 못 함.
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON modules.comments (parent_id)
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_document_ip_view_log_document_id
  ON modules.document_ip_view_log (document_id);
