# design-sync 메모 (dasanamc UI)

## 1차 sync (2026-06-24)

- 패키지: `@repo/ui` — shadcn/ui 패턴, 16 컴포넌트 (Accordion/Badge/Button/Card/
  Carousel/Checkbox/Dialog/Input/Label/Popover/Select/Slider/Table/Tabs/Textarea/
  PageHeader)
- 제외: `PdfViewer`, `PdfViewerInternal` (react-pdf 의존이 무거움), `FullPageLoader`
  (간단 유틸)
- 모든 컴포넌트를 **floor card** 로 업로드 (typographic placeholder).
  컴포넌트 자체는 bundle 에 fully functional 로 들어가 있어 design agent 가
  코드로 사용 가능. preview rich card 는 후속 sync 시 점진 추가 가능.

## 환경 / 빌드 quirks

- 이 레포는 **pnpm workspace** monorepo. `@repo/ui` 가 `private`/workspace 패키지라
  `node_modules/@repo/ui` 가 기본적으로 없음. 컨버터의 `dts.mjs` 가
  `node_modules/<pkg>/package.json` 을 직접 read 하므로 sync 전에 symlink 필요:
  ```sh
  mkdir -p node_modules/@repo
  ln -sfn "$(pwd)/packages/ui" node_modules/@repo/ui
  ```
  이 심볼릭 링크는 `.gitignore` 의 `node_modules` 룰로 자동 제외됨 — 재 clone 시
  매번 다시 생성해야 함.
- `@repo/ui` 는 **build script 가 없음** (`src/index.ts` 를 직접 export). 따라서
  컨버터는 src 를 직접 읽음. `--entry` 인자를 주면 dist 가 있다고 판단해서 d.ts
  스캔이 0 매칭이 됨 — `--entry` 빼고 `componentSrcMap` 으로 16개 컴포넌트
  명시적 매핑.
- 작업 디렉토리는 **`packages/ui/`** 에서 실행. config 의 `tsconfig`/`srcDir` 가
  cwd 기준 상대 경로.
- `cssEntry` 는 한 번 `../../apps/web/app/app.css` 로 시도 했지만 컨버터가
  "package boundary 밖" 이라며 거부. 현재 config 는 cssEntry 미지정 →
  `[CSS_RUNTIME]` warn (CSS-in-JS DS 로 인식). Tailwind 기반 + 호스트가 토큰
  제공하는 구조라 acceptable.

## 알려진 render warns (legitimate)

- `[RENDER_BLANK]` Button / Checkbox / Input / Textarea: 컴포넌트가 너무 작아서
  floor card PNG 가 5KB 미만. 의도된 floor 상태. **추가 sync 시 무시.**
- `[CSS_RUNTIME]`: shipped CSS 없음 (Tailwind 의존). 호스트가 토큰/유틸리티
  CSS 를 정의. acceptable.

## Re-sync risks

- `apps/web/app/app.css` 의 `--color-ds-*` 토큰은 sync bundle 에 안 들어감.
  agent 가 디자인할 때 토큰 변수명만 사용한다는 가정. host 가 토큰 정의를
  바꾸면 시각이 바뀜.
- `componentSrcMap` 이 16개를 명시 — `@repo/ui` 에 새 컴포넌트가 추가되면 여기에
  수동 등록해야 sync 됨. d.ts 스캔이 동작하면 자동이지만 지금은 src 직접 모드라
  자동 픽업 안 됨.
- conventions.md 는 다산원 브랜드 톤. **외주 fork 시 토큰 표 값 + 폰트 패밀리
  교체 필요**.
- 빌드 script 추가 권장: `tsup` 또는 `vite build` 로 `dist/` 를 만들면 d.ts 가
  자동 emit 되고 컨버터의 default 경로(`exportedNames`)가 동작 → `componentSrcMap`
  유지 불필요.
