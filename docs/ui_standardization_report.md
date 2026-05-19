# UI 표준화 진행 보고서
**날짜**: 2026-03-16
**상태**: 완료 (핵심 모듈)

## 1. 개요
이 작업의 주된 목표는 모노레포 내의 모든 관리자 및 공통 컴포넌트의 UI를 표준화하는 것이었습니다. 구체적인 디자인 방향은 **"Angular & Shadow-free"** (각진 형태 및 그림자 제거) 미학을 따르며, 기존의 일반적인 디자인 패턴을 프로젝트 브랜드에 부합하는 프리미엄하고 날카로운 디자인으로 교체했습니다.

## 2. 공통 UI 컴포넌트 업데이트 (@repo/ui)
디자인 시스템을 근본부터 적용하기 위해 핵심 컴포넌트 라이브러리를 업데이트했습니다. 다음 컴포넌트들은 이제 엄격하게 `rounded-none`을 사용하며 기본 그림자가 제거되었습니다.

| 컴포넌트 | 디자인 변경 사항 | 목적 |
| :--- | :--- | :--- |
| **Button** | `rounded-none`, `shadow-none` | 통일된 액션 요소 |
| **Input** / **Textarea** | `rounded-none`, `border-input` | 일관된 폼 필드 |
| **Select** | `rounded-none`, `shadow-none` | 표준화된 선택 UI |
| **Card** | `rounded-none`, `shadow-none` | 각진 컨테이너 |
| **Checkbox** | `rounded-none` | 명확한 사각형 선택 |
| **Dialog** / **Popover** | `rounded-none`, `shadow-none` | 깔끔한 오버레이 |
| **Tabs** | `rounded-none` | 구조화된 네비게이션 |
| **Badge** | `rounded-none` | 간결한 라벨링 |

---

## 3. 모듈별 표준화 작업

### 📦 module-board (게시판 관리)
모든 스킨과 관리 도구를 일치시키기 위해 가장 광범위한 리팩토링이 진행된 모듈입니다.
- **관리자 페이지**: `new.tsx`, `edit.tsx`, `page.tsx`, `delete.tsx`가 완전히 리팩토링되었습니다.
- **컴포넌트**: `BoardPermissionSelector`, `BoardDisplayOptionsSelector`, `CategoryManager`, `BoardAdminTabs`가 공통 UI 요소를 사용하도록 변경되었습니다.
- **템플릿**: `admin/templates/list.tsx` 및 `edit.tsx`에서 기존 네이티브 입력창을 제거했습니다.
- **스킨 및 위젯**: 
    - `latest-posts.tsx` 위젯: 둥근 모서리가 있는 로딩 스켈레톤을 제거했습니다.
    - 기본/포토/FAQ 스킨: 버튼 및 댓글 영역을 표준화했습니다.

### 👥 module-bxmember (동문 관리)
- **회원 목록**: 메인 회원 테이블과 검색 인터페이스를 리팩토링했습니다.
- **모달**: SMS/이메일/알림톡 모달을 표준화된 `@repo/ui` 컴포넌트를 사용하도록 업데이트했습니다.
- **버튼**: 모든 액션 버튼(엑셀 업로드/다운로드, 전송 등)이 각진 디자인을 따릅니다.

### 🏢 module-organization (조직 관리)
- **조직 관리자**: 계층적 조직 관리 UI를 리팩토링했습니다.
- **알림톡 모달**: 새로 구현 및 리팩토링된 `OrganizationGroupAlimtalkModal`은 엄격한 각진 디자인 규칙을 따르며 `PositionTransferList`를 사용합니다.

### 📩 module-sms
- **SMS 설정**: 제공자 관리 및 대시보드 개요 페이지를 리팩토링했습니다.

---

## 4. 주요 개선 사항
- **시각적 일관성**: 모든 `rounded-*` 및 `shadow-*` 유틸리티 클래스를 고정밀로 제거했습니다.
- **유지보수성**: 모든 네이티브 HTML 폼 요소(`input`, `select`, `button`)를 `@repo/ui` 대응물로 교체하여, 향후 전역 스타일 업데이트가 용이하도록 개선했습니다.
- **성능/UX**: 모듈 전반에 걸쳐 버튼 높이와 호버 상태를 표준화하여 예측 가능한 사용자 경험을 제공합니다.

## 5. 향후 계획
- **지속적인 검토**: 새로 생성되는 컴포넌트(특수 차트나 복잡한 위젯 등)가 계속해서 `@repo/ui`에서 임포트하도록 관리합니다.
- **사용자 피드백**: 관리자 사용성을 모니터링하여 "각진" 디자인이 높은 접근성과 가독성을 유지하는지 확인합니다.

---

> [!TIP]
> 이 표준을 유지하기 위해 항상 네이티브 HTML 요소 대신 `@repo/ui` 컴포넌트를 사용하세요. 커스텀 컨테이너가 필요한 경우 그림자나 둥근 모서리 대신 `border`와 `rounded-none`을 우선적으로 사용하십시오.
