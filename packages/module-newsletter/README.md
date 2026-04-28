# @repo/module-newsletter

뉴스레터 발송 모듈. 이메일 캠페인 작성/발송/구독자 관리.

## 진입점

```ts
import { module as newsletter } from "@repo/module-newsletter/module";
```

## 라우트

- 관리자: `/admin/newsletter` (목록), `/admin/newsletter/new` (작성), `/admin/newsletter/edit/:id`
- 공개: 구독/구독해지 (이메일 토큰 기반)

## 의존성 (legacy)

⚠️ `@repo/module-file` — 첨부 파일 업로드.

## 발송 큐

대량 발송은 백그라운드 작업으로 분리되어야 한다 (현재 동기 발송이 남아있음 — 개선 과제). SMTP 또는 외부 ESP 어댑터는 `src/.server/` 에 위치.

## DB

- `newsletters` — 캠페인 메타
- `newsletter_subscribers` — 구독자 (이메일, 동의일, 구독해지 토큰)
- `newsletter_sends` — 발송 로그 (오픈/클릭 추적용)
