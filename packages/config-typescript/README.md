# @repo/config-typescript

공유 TypeScript 컴파일러 설정. 각 패키지 `tsconfig.json` 이 이 패키지의 base 를 extends.

## 사용

```jsonc
// packages/{내-패키지}/tsconfig.json
{
  "extends": "@repo/config-typescript/react.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 제공 설정

- `base.json` — 서버/유틸 패키지용. ES2022, ESM, strict, `verbatimModuleSyntax: true`, `resolveJsonModule: true`
- `react.json` — UI/모듈용. base + JSX 옵션 + `lib: ["DOM", ...]`

## 변경 영향 범위

이 파일을 수정하면 _모든_ 워크스페이스 패키지의 컴파일 동작이 바뀐다. 단일 패키지 옵션이 필요하면 해당 `tsconfig.json` 의 `compilerOptions` 에서 override.
