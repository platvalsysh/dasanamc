# @repo/layout-default

공개 사이트의 기본 레이아웃 (Header / Outlet / Footer).

## 사용

`apps/web/app/routes.ts` 에서:

```ts
layout("./layouts/default.tsx", [
  route("/", "./routes/home.tsx"),
  // ...
  ...moduleManager.getRoutes("public"),
]),
```

`./layouts/default.tsx` 가 이 패키지의 `<DefaultLayout>` 을 사용한다.

## 구성

- 헤더: 사이트 메뉴(`@repo/core` 의 `getSiteMenu`), 로그인/마이페이지 링크
- 본문: `<Outlet />`
- 푸터: 회사 정보, 패밀리사이트 링크, 약관/개인정보처리방침

## 디자인 변형

레이아웃을 통째로 갈아끼우려면 `@repo/layout-example` 을 베이스로 새 패키지 만들고 `apps/web/app/layouts/default.tsx` 에서 import 만 교체.
