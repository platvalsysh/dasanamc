# @repo/module-sms

SMS / LMS / MMS / 카카오 알림톡 발송 모듈. 다중 프로바이더 지원 (Solapi, Console).

## 진입점

```ts
import { module as sms } from "@repo/module-sms/module";
import { smsService } from "@repo/module-sms";

await smsService.send({ to: "010-1234-5678", text: "..." });
await smsService.sendKakao({
  to,
  text,
  channelId: "...",
  templateId: "...",
  type: "ATA",
  variables: { "#{인증번호}": code },
});
```

## 프로바이더

- `SolapiSmsProvider` — Solapi (CoolSMS 후신). 운영 기본값.
- `ConsoleSmsProvider` — 개발 환경에서 콘솔 출력만. `SMS_TEST_MODE=1` 에서 자동 활성화.

`SmsService` 는 환경 변수에 따라 적절한 프로바이더를 선택. 페일오버는 `failover.ts` 에 정의.

## 라우트

- 관리자: `/admin/sms`, `/admin/sms/solapi/dashboard/*`, `/admin/sms/console/dashboard/*`
- 카카오 템플릿 관리: `/admin/sms/solapi/dashboard/kakao/templates/*`

## 환경 변수

- `SMS_TEST_MODE` — `1` 이면 Console 프로바이더 강제
- `SMS_TEST_NUMBER` — 테스트 번호 (실제 발송 대신 이 번호로만 발송)
- Solapi 자격증명은 DB `configs` 테이블에 보관 (`module:sms` scope)
