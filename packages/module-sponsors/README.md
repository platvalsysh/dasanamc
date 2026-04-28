# @repo/module-sponsors

후원/스폰서 모듈. 후원사 명단 + 로고 + 등급 관리.

## 진입점

```ts
import { module as sponsors } from "@repo/module-sponsors/module";
```

## 라우트

- 공개: `/sponsors` — 후원사 그리드 (등급별 정렬, 로고 + 외부 링크)
- 관리자: `/admin/sponsors` — 등록/수정/순서 변경

## 의존성 (legacy)

⚠️ `@repo/module-file` — 로고 업로드.

## 데이터 모델

`sponsors` 테이블: 이름, 등급, 로고 file_id, 외부 URL, 노출 여부, 정렬 순서.

후원 등급 (gold/silver/bronze 등) 은 DB `configs` (`module:sponsors`) 또는 enum 으로 관리.
