# @repo/module-schedule

일정/캘린더 모듈. 행사 등록, 카테고리 분류, 공개 일정 페이지 / 관리자 편집.

## 진입점

```ts
import { module as schedule } from "@repo/module-schedule/module";
```

## 라우트

- 공개: `/schedule` (목록, 캘린더 뷰)
- 관리자: `/admin/schedule/new`, `/admin/schedule/edit/:id`

## 데이터 모델

- `schedules` — 일정 (제목, 시작일/종료일, 종일 여부, 카테고리, 위치)
- `schedule_categories` — 분류 (색상 포함)

## 외부 모듈 의존 없음

이 모듈은 다른 `@repo/module-*` 를 import 하지 않는 _깨끗한_ 모듈이다. 신규 모듈 작성 시 좋은 참고 대상.
