# @repo/layout-example

레이아웃 작성 참고용. **프로덕션 미사용.** 새 레이아웃 패키지 만들 때 베이스로 복제.

## 새 레이아웃 만들기

```bash
cp -r packages/layout-example packages/layout-{내-레이아웃}
```

이후:
1. `package.json` 의 `name` 변경
2. `apps/web/app/layouts/{기존}.tsx` 가 새 레이아웃 패키지를 import 하도록 교체
3. `routes.ts` 의 `layout(...)` 호출 경로 확인

## 무엇을 보여주나

- 헤더/푸터/Outlet 골격
- `@repo/core/ui` 의 `useSiteMenu` 사용 예
- `@repo/auth/ui` 의 인증 상태 노출 패턴

## ESLint ignore 등록됨

[eslint.config.mjs](../../eslint.config.mjs) 에서 `**/layout-example/**` 를 ignore — 참고 코드라 lint 부담 없이 수정 가능.
