# 디자인 시스템 (Design System)

`chemeng` 프로젝트는 사용자의 역할과 페이지의 목적에 따라 **두 가지 상이한 디자인 시스템**을 운영합니다. 일반 사용자용 페이지는 SNU 브랜드 정체성을 극대화한 **Classic Angular** 시스템을, 관리자용 페이지는 업무 효율과 가독성에 최적화된 **Modern Admin** 시스템을 사용합니다.

---

## 🏛️ 1. 일반 사용자용 디자인 시스템 (Classic Angular)

이 시스템은 **서울대학교(SNU) 브랜드 정체성**을 기반으로 하며, **"샤프한 프리미엄 각진 디자인 (Premium Angular & Shadow-free)"**을 지향합니다.

### 📐 핵심 원칙
- **Angular (각진 디자인)**: 모든 UI 요소는 `rounded-none`을 원칙으로 합니다. 버튼, 카드, 모달 등 어디에도 라운드(곡선)를 적용하지 않습니다.
- **Shadow-free (그림자 제거)**: 모든 요소에서 `shadow-*` 클래스를 제거합니다. 깊이감은 배경색의 명도 차이(`bg-muted/20`)나 테두리(`border-border`)로만 표현합니다.
- **Icon Set**: `lucide-react`를 표준으로 사용합니다. Icons는 얇고 정교한 느낌의 스타일을 선호합니다.
- **Component-First**: `@repo/ui` 패키지에 구현된 표준 컴포넌트 사용을 강제합니다.

### 🎨 색상 및 타이포그래피
- **SNU Blue**: `#0f0f70` (Primary) - 신뢰와 정통성.
- **SNU Beige**: `#dcdab2` (Secondary) - 따뜻함과 보조 강조.
- **Sans Font**: `"Pretendard Variable"`을 메인으로 사용하며, Noto Sans KR을 폴백으로 사용합니다.
- **Serif Font**: `"Noto Serif KR"`을 사용하여 고전적이고 격조 있는 느낌을 전달합니다.

---

## 🛠️ 2. 관리자용 디자인 시스템 (Modern Admin)

관리자 전용 페이지는 별도의 UI 패키지([@repo/ui-admin](file:///c:/Users/YSH/Documents/workspace/chemeng/packages/ui-admin))와 전용 테마를 사용하여 구현됩니다. 신속한 데이터 처리와 복잡한 관리 기능을 위해 최적화되어 있습니다.

### 🍱 핵심 기술 스택
- **Base UI**: Radix UI (Headless UI)
- **Component Library**: shadcn/ui 기반의 전용 프리셋 (`avVUIPD`)
- **Icon Library**: `lucide-react`

### 📐 핵심 디자인 원칙
- **Scoped Style**: 모든 스타일은 `.admin-theme` 클래스 하위에 스코핑되어 있어 메인 앱의 스타일과 충돌하지 않습니다.
- **Soft Rounding**: 각진 폼을 고수하는 메인 앱과 달리, 사용자 친화적인 적당한 곡률(`--radius: 0.625rem`)을 허용하여 업무 피로도를 낮웁니다.
- **Data-Centric**: 고밀도 정보 배치를 위해 최적화된 테이블, 차트, 사이드바 컴포넌트를 사용합니다.

### 🎨 전용 디자인 토큰 (Design Tokens)
- **폰트**: 전체 서비스와 일관성을 위해 **Pretendard Variable**을 사용합니다.
- **브랜드 컬러 (Admin Brand)**:
  - **Brand 1-3**: 업무 일관성을 위한 따뜻한 베이지/화이트 톤 (#F6F4F1, #E7E1D9, #CFC6BC).
  - **Brand 4**: 가독성이 높은 어두운 차콜 (#2E2A26).
- **컴포넌트 특징**:
  - `shadcn`의 최신 표준을 따르며, 모든 컴포넌트는 `packages/ui-admin/src/components/ui`에 설치되어 있습니다.
  - 내보내기 지점인 [`@repo/ui-admin/src/index.ts`](file:///c:/Users/YSH/Documents/workspace/chemeng/packages/ui-admin/src/index.ts)를 통해 통합 관리됩니다.

---

## 🔄 3. 시스템 간 공통 사항 및 주의

### 🔡 공통 폰트 시스템
모든 시스템은 로딩 성능과 시각적 완성도를 위해 다음 폰트를 공통적으로 불러옵니다:
1. **Pretendard Variable** (Sans-serif): UI 본문 및 액션 요소.
2. **Noto Serif KR** (Serif): 강조 문구 및 인용구.

### 🔗 개발 가이드
- **관리자 페이지 전용 UI 사용 (필수)**: `packages/*/src/admin` 하위에서 개발하는 모든 관리자 기능은 반드시 `@repo/ui` 대신 **`@repo/ui-admin`** 패키지를 사용해야 합니다. 이는 관리자 도구의 일관된 사용자 경험과 데이터 중심 UI를 유지하기 위함입니다.
- **표준 아이콘 사용 (필수)**: 아이콘은 프로젝트 전반에서 **`lucide-react`**를 표준 라이브러리로 사용합니다. `react-icons`나 다른 라이브러리 사용을 지양하고 모든 아이콘을 Lucide로 통일합니다.
- **표준 컴포넌트 우선 사용**: 디자인 및 기능 구현 시 반드시 `@repo/ui` 또는 `@repo/ui-admin`의 컴포넌트를 **있는 그대로(As-is)** 사용하는 것을 원칙으로 합니다.
- **커스텀 스타일 지양**: 컴포넌트 호출 시 추가적인 Tailwind 클래스(`className`)나 인라인 스타일, 별도의 CSS 클래스 정의를 최대한 지양합니다. 색상, 간격, 크기 등은 이미 컴포넌트와 테마에 정의된 표준을 따르세요.
- **컴포넌트 선택**:
  - `/admin/*` 경로의 기능 구현 시에는 반드시 `@repo/ui-admin` 컴포넌트를 사용하세요.
  - 공개용 페이지(`/clinic/*`, `/membership/*` 등) 구현 시에는 `@repo/ui` 컴포넌트를 사용하세요.
- **충돌 방지**: 어드민 전용 스타일을 수정할 때는 [`packages/ui-admin/src/admin.css`](file:///c:/Users/YSH/Documents/workspace/chemeng/packages/ui-admin/src/admin.css) 내부의 `.admin-theme` 블록 안에서만 작업해야 합니다.

> [!IMPORTANT]
> **시스템 격리**: `@repo/ui`와 `@repo/ui-admin`은 서로 독립적으로 운영됩니다. 어드민 페이지 구성 요소가 지나치게 메인 앱 디자인과 닮아가거나, 그 반대의 경우가 발생하지 않도록 각 디자인 시스템의 원칙을 엄격히 준수하세요.
