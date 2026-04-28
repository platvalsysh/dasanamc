# @repo/ui

공개(사용자) 페이지용 UI 컴포넌트. shadcn/ui + Radix 기반.

## 사용

```tsx
import { Button, Card, Input, Label, Select } from "@repo/ui";
```

## 포함 컴포넌트

기본:
- `Button`, `Input`, `Label`, `Textarea`, `Checkbox`, `Switch`
- `Card` / `CardHeader` / `CardContent` / `CardFooter`
- `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` / `SelectValue`
- `Dialog`, `DropdownMenu`, `Popover`, `Tooltip`
- `Tabs`, `Accordion`

복합:
- `Carousel` (embla 기반)
- `PdfViewer` (pdfjs-dist + react-pdf)
- `DatePicker` (react-day-picker)

## 디자인 토큰

`@repo/ui/styles.css` 가 Tailwind 변수(`--background`, `--foreground`, `--primary`, ...) 를 정의. 외주 클라이언트는 본인 사이트 디자인에 맞춰 변수만 덮어쓰면 됨.

## 의존성

- `radix-ui`, `class-variance-authority`, `tailwind-merge`, `clsx`
- `react`, `react-dom` (peer)

## ui-admin 과 차이

| | `@repo/ui` | `@repo/ui-admin` |
|---|---|---|
| 대상 | 공개 사이트 | 관리자 대시보드 |
| 톤 | 브랜드 컬러 변수 | dark theme 친화 |
| 컴포넌트 | 폼/카드/캐러셀 위주 | 데이터 테이블/차트/리치 다이얼로그 |
