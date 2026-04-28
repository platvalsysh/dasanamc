# @repo/module-editor

위지위그 에디터 (TipTap 기반). 게시판 등에서 본문 편집기로 사용.

## 진입점

```tsx
import { Editor, SimpleEditor } from "@repo/module-editor/ui";

<Editor value={value} onChange={setValue} onUpload={...} />
```

`Editor`: 모든 확장 기능(테이블, 이미지 업로드, 코드블록, 링크, 컬러 등) 포함.
`SimpleEditor`: 댓글 등 가벼운 입력에 사용 (볼드/이탤릭/링크 정도).

## 의존성 (legacy)

⚠️ `@repo/module-file` — 이미지 업로드 시 파일 모듈의 storage API 직접 호출. 추후 함수형 props 로 분리 예정.

## TipTap 확장

`@tiptap/starter-kit` + 별도 catalog 등록된 확장:
- color, font-family, highlight, image, link, list, table, text-align, underline, youtube, ...

새 확장 추가 시:
1. `pnpm-workspace.yaml` 의 catalog 에 등록
2. `package.json` deps 에 추가
3. `src/ui/extensions.ts` 에서 import + `useEditor({ extensions: [...] })` 에 추가

## 컴포넌트 디렉토리

- `components/tiptap-node/` — Node 정의 (image, code-block, ...)
- `components/tiptap-ui/` — 툴바 버튼/팝업
- `components/tiptap-ui-primitive/` — 공통 프리미티브 (tooltip, popover)
- `hooks/` — 에디터 동작 훅
