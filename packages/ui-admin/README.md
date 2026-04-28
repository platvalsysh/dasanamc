# @repo/ui-admin

관리자 대시보드 전용 UI 컴포넌트. `@repo/ui` 와 별도로 분리해 _공개 사이트 번들에 어드민 컴포넌트가 끼지 않도록_ 한다.

## 사용

```tsx
import { Table, TableHead, TableBody, TableRow, TableCell } from "@repo/ui-admin";
```

## 포함

- 데이터 테이블 (`Table*`, 정렬/페이지네이션 헬퍼)
- 어드민 폼 (`Input`, `Label`, `Textarea`, `Select`, `Switch`)
- 다이얼로그/드로어 (큰 데이터 편집용)
- 차트 (예정)
- 어드민용 `Tabs`, `Card`, `Dialog`, `Tooltip`

## 의존성

- `radix-ui`, `class-variance-authority`, `tailwind-merge`
- `react`, `react-dom` (peer)

## ui 와 분리 이유

번들 분리 외에도, 어드민은 일반적으로:
- 더 정보 밀도 높은 레이아웃 (작은 폰트, 좁은 padding)
- 다크 톤 기본
- 외주 사이트별 디자인 커스터마이징 *불필요* (관리자 화면은 공통 운영)

따라서 디자인 토큰을 외주 사이트 변수와 독립시키는 편이 유지보수에 유리.
