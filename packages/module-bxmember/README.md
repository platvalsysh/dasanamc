# @repo/module-bxmember

회원/동문 데이터 관리 모듈. 졸업생 명부, 교수, 명예교수 등 _도메인 특화 회원 레코드_ 를 다룬다 (Supabase Auth 의 일반 사용자와 별개).

## 진입점

```ts
import { module as bxmember } from "@repo/module-bxmember/module";
```

## 주요 기능

- 회원 명부 CRUD + 엑셀 업로드/다운로드
- 교수(`bxprofessor`) / 명예교수(`bxemeritus`) / 일반 회원(`bxmember`) 구분
- 사용자 그룹(`bxmember_groups`) — 그룹 단위 SMS / 카카오 알림톡 / 이메일 발송
- 회원 ↔ Supabase Auth 사용자 매칭 (UserTable 의 alumni-match 흐름)

## 라우트

- 관리자: `/admin/bxmember/*`, `/admin/professor/*`, `/admin/emeritus/*`, `/admin/group/*`
- API: 그룹 멤버 검색/추가/엑셀, 발송용 카카오 템플릿 조회 등

## 의존성 (legacy)

⚠️ `@repo/module-file`, `@repo/module-sms` 직접 import. 발송 추상화는 `@repo/shared-*` 로 추출 예정.

## 발송 흐름

1. 그룹 선택 → 대상 회원 목록 산출
2. 발송 모달에서 채널 선택 (SMS / 카카오 / 이메일)
3. 각 모달이 해당 채널의 템플릿 조회 + 변수 매핑
4. 서버 액션이 `module-sms` 의 SmsService 또는 메일 핸들러로 발송
