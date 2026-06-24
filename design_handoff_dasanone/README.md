# 핸드오프: 다산원동물의료센터 리브랜딩 (SNU 동창회 템플릿 → 24시 다산 원동물의료센터)

> **Claude Code 사용법**
> 1. 로컬 레포(`dasanamc`) 루트에서 Claude Code 실행
> 2. 이 폴더(`design_handoff_dasanone/`)를 레포 안 아무 곳에 두기
> 3. 프롬프트: *"design_handoff_dasanone/README.md 를 읽고, develop에서 새 브랜치를 만들어 모든 변경을 적용하고 커밋해줘."*
>
> 이 패키지는 **참조 자료 + 정확한 변경 지시서**입니다. `reference/다산원동물의료센터.dc.html` 는
> 의도된 디자인/콘텐츠를 보여주는 HTML 프로토타입이며, 그대로 복사하는 게 아니라
> 기존 React Router(v7) 코드베이스의 패턴에 맞춰 반영하면 됩니다.

---

## 0. 작업 개요
현재 레포는 **서울대 화학생물공학부 동창회** 사이트 템플릿입니다. 이걸 **24시 다산 원동물의료센터**
(동물병원) 사이트로 리브랜딩합니다. 변경은 3종류:
1. **바로 복사** — 완성된 파일 2개 (틸 컬러 토큰 + 로고)
2. **텍스트/콘텐츠 치환** — 홈·공통 컴포넌트의 동창회 문구 → 다산원 문구 (아래 파일별 지시)
3. **콘텐츠 페이지 재작성** — 소개/행사/회비/약관 등 (다산원 정보 시트 기반)

새 브랜치 권장: `feat/dasanone-rebrand`

---

## 1. 바로 복사 (그대로 덮어쓰기)

| 이 패키지의 파일 | 레포 목적지 |
|---|---|
| `ready-to-copy/apps/web/app/app.css` | `apps/web/app/app.css` |
| `ready-to-copy/apps/web/public/images/logo.png` | `apps/web/public/images/logo.png` |

- **app.css**: 브랜드 토큰만 SNU 네이비/골드 → 다산원 틸 톤으로 교체(배경 흰색 유지).
  토큰 기반이라 헤더·버튼·강조색 전체가 한 번에 바뀝니다.
- **logo.png**: 새 가로형 로고. 헤더·푸터가 이미 `/images/logo.png` 를 참조하므로 파일 교체만으로 적용.

### 틸 토큰 매핑 (참고 — 이미 app.css에 반영됨)
```
--color-snublue   #30325a → #0f3b36   (딥 틸: 헤더 배경·주색·제목)
--color-snugold   #c5a86f → #12a594   (포인트 틸)
--color-snubeige  #dcdab2 → #d6efe9   (보조 라이트 틸)
--color-snugray   #888888 → #6f7d79
--color-snusilver #b5b6b6 → #c4d3ce   (보더)
스크롤바/선택영역: #CFC6BC/#2E2A26 → #bcd0cb/#0f3b36
```
> 코드 곳곳에 하드코딩된 `#30325a` 가 있으면(`membership.tsx` 등) `var(--color-snublue)`
> 또는 `#0f3b36` 으로 바꿔주세요. 레포 전체 검색: `#30325a`, `#c5a86f`.

---

## 2. 다산원 정보 시트 (모든 치환의 출처)

```
상호      24시 다산 원동물의료센터 (DASANONE ANIMAL MEDICAL CENTER)
대표      이현우
사업자등록 692-07-03028
전화      0507-1330-5958 / 031-522-5956
이메일    dasanoneamc@gmail.com
주소      경기 남양주시 다산중앙로 15, 3층
진료시간  주간 일반 09:30~21:00 · 야간 응급 21:00~09:30 · 회진 12:30~13:00
          365일 24시간 연중무휴 · 야간 진료비 +40,000원
주차      건물 지하 3시간 30분 무료 · 공영주차장 2시간 무료
블로그    https://blog.naver.com/dasanoneamc
카카오톡  검색 "24시 다산 원동물의료센터"
지도      https://map.naver.com/p/search/남양주 다산원동물의료센터

특화진료센터 11개: 간담낭췌장 · 종양항암 · 심장 · 내시경 · CT영상 · 골관절 ·
              신경외과 · 일반외과 · 고양이전문클리닉 · 응급중환자 · 건강검진
의료진 6명(전원 석사 이상):
  이현우 대표원장·외과 / 조항빈 대표원장 / 임동환 진료과장 /
  정지윤 내과원장 / 박병준 응급과장 / 이선아 영상과장
강점: 분과 협진 · 외과 전공 대표원장 직접 집도 · 대학병원급 CT 당일 판독 · 고양이 전용 공간
```
> 더 자세한 카피(센터별 소개, 검진 패키지, FAQ, 진료시간 표)는 `reference/다산원동물의료센터.dc.html` 안에 전부 있습니다.

---

## 3. 파일별 변경 지시 (홈 + 공통)

### 3-1. `packages/layout-default/src/components/header.tsx`
- 로고 `<img>` 의 `alt` 변경:
  `alt="서울대학교 화학생물공학부 동창회"` → `alt="24시 다산 원동물의료센터"`
- `MENU_ITEMS_FALLBACK` 의 동창회 메뉴 → 다산원 메뉴로 교체(실제 메뉴는 DB/설정 우선, 4-1 참고):
  예) 병원소개(/about/greeting…), 특화진료센터, 건강검진, 고객센터.
- 헤더 배경은 `bg-[var(--color-snublue)]` 그대로 두면 자동으로 딥 틸이 됩니다(수정 불필요).

### 3-2. `apps/web/app/components/site-footer.tsx` **와** `packages/layout-default/src/components/site-footer.tsx`
(두 파일 거의 동일 — 동일하게 수정)
- 로고 `alt` → `"24시 다산 원동물의료센터"`
- 주소 블록:
  - `(08826) 서울특별시 관악구 관악로 1 서울대학교 302동` → `경기 남양주시 다산중앙로 15, 3층`
  - `Tel: 02-880-1234 | Email: alumni@snu.ac.kr` → `Tel: 0507-1330-5958 / 031-522-5956 | Email: dasanoneamc@gmail.com`
  - 한 줄 추가 권장: `365일 24시간 연중무휴 · 야간 응급 21:00~09:30`
- "바로가기" 리스트 → `병원소개(/about/greeting)` · `특화진료센터` · `공지사항(/board/Notice)` · `오시는 길(/about/contact)`
- "관련 사이트"(SNU 3개) → 다산원 관련으로 교체:
  - 네이버 블로그 `https://blog.naver.com/dasanoneamc`
  - 네이버 지도(오시는 길) `https://map.naver.com/p/search/남양주 다산원동물의료센터`
  - (선택) 카카오톡 채널
- 카피라이트:
  `© 2024 SNU Chemical & Biological Engineering Alumni Association. All rights reserved.`
  → `© 2026 DASANONE Animal Medical Center. All rights reserved.`

### 3-3. `apps/web/app/components/hero-carousel.tsx`
`SLIDES` 배열(3개)을 다산원 내용으로 교체. 예시:
```
1) title: "365일 24시간, 다산원동물의료센터"
   subtitle: "말 못 하는 아이의 작은 신호 하나도 놓치지 않겠습니다. 연중무휴 24시간 응급진료."
   primaryAction: { label: "전화 예약·문의", href: "tel:0507-1330-5958" }
   secondaryAction: { label: "병원 소개", href: "/about/greeting" }
2) title: "11개 특화진료센터, 한 곳에서"
   subtitle: "분과별 전공의 협진과 대학병원급 CT로 진단부터 수술·회복까지 원스톱."
   primaryAction: { label: "특화진료센터", href: "/centers" }   // 또는 실제 라우트
   secondaryAction: { label: "건강검진", href: "/checkup" }
3) title: "수준 높은 의료 서비스"
   subtitle: "외과 전공 대표원장 직접 집도, 6명의 석사 이상 전문 의료진."
   primaryAction: { label: "의료진 소개", href: "/about/greeting" }
   secondaryAction: { label: "네이버 블로그", href: "https://blog.naver.com/dasanoneamc" }
```
- 슬라이드 이미지 URL(현재 SNU/언스플래시)은 다산원 실제 사진으로 교체 필요 → 없으면 일단 유지하고 TODO 주석.
- 버튼 `bg-primary` 는 토큰 덕분에 자동 틸.

### 3-4. `apps/web/app/components/feature-section.tsx`
`features`(4개) + 제목/설명 교체:
```
제목: "왜 다산원동물의료센터일까요?"
설명: "대학병원급 진단 인프라와 분과별 전공의 협진으로 한 곳에서 완결되는 진료."
features:
  - icon: Stethoscope(또는 유지)  title: "분과별 협진 진료"   desc: "내과·외과·영상의학과 협진으로 최상의 의료 서비스."
  - icon: Activity                title: "외과 대표원장 집도"  desc: "정형외과부터 신경외과까지 외과 전공 대표원장이 직접 집도."
  - icon: ScanLine                title: "대학병원급 CT"      desc: "대학병원급 CT·영상장비로 촬영 당일 정밀 판독."
  - icon: Cat                     title: "고양이 전용 공간"    desc: "예민한 고양이를 위한 분리된 전용 대기·처치·입원 공간."
```
(lucide-react 아이콘으로 교체; 없으면 기존 아이콘 유지)

### 3-5. `apps/web/app/components/news-section.tsx`
- `description="동창회의 새로운 소식을 전해드립니다."` → `"다산원동물의료센터의 새로운 소식과 진료 케이스를 전해드립니다."`
- `NEWS_SECTION_MIDS`(게시판 mid 배열)는 실제 게시판 구성에 맞게 조정(예: `Notice`만 두거나 병원 공지/케이스 게시판).
- 같은 기본 문구가 `packages/module-board/src/components/widget/latest-posts.tsx:36` 에도 있음 → 동일 취지로 수정.

### 3-6. `apps/web/app/routes/home.tsx`
- `meta`: `title` → `"24시 다산 원동물의료센터"`, `description` → `"경기 남양주 24시 동물병원. 11개 특화진료센터, 대학병원급 CT, 365일 24시간 연중무휴 응급진료."`

---

## 4. 콘텐츠 페이지 (구조 유지, 내용 재작성)

> 이 페이지들은 동창회 전용 콘텐츠라 다산원 맥락으로 **새로 써야** 합니다.
> 레이아웃/컴포넌트는 그대로 두고 텍스트만 교체하세요. 상세 카피는 `reference/*.dc.html` 참고.

### 4-1. 메뉴/네비게이션 (중요)
- 실제 메뉴는 `menuItems` prop 으로 주입됨(DB 또는 설정). 출처 추적:
  `packages/core`(SiteMenuConfigItem), `packages/database`, `apps/web/app/modules.server.ts`, 시드 데이터 검색.
- 동창회 IA(동창회소개/활동/게시판/회비) → 다산원 IA 로 교체 제안:
  - **병원소개**: 인사말·의료진·시설·장비
  - **특화진료센터**: 11개 센터
  - **건강검진**: 강아지/고양이 검진 프로그램
  - **고객센터**: 공지사항·FAQ·오시는 길·온라인 문의
- `header.tsx` 의 `MENU_ITEMS_FALLBACK` 도 같은 구조로.

### 4-2. `routes/about/greeting.tsx`
- 동창회장 인사말 → **대표원장 인사말**(이현우). "아픈 아이를 안고 병원 문을 들어서는 보호자님의 무거운 마음…
  세 가지 ONE 약속" 톤(reference 의 manifesto/3 ONE 참고). 서명: "24시 다산 원동물의료센터 대표원장 이현우".
- 사진 alt/캡션의 "제25대 동창회장 이준혁" → "대표원장 이현우".

### 4-3. `routes/about/contact.tsx`
- 주소/연락처/약도/지하철 안내 → 다산원 정보 시트 값으로. 지도 링크는 네이버 지도.
- 이메일 `chemalum@snu.ac.kr` → `dasanoneamc@gmail.com`.

### 4-4. `routes/about/bylaws.tsx` (정관)
- 동물병원에 "동창회 정관"은 불필요. **권장: 라우트 제거 또는 "진료안내/병원 이용안내"로 대체**
  (진료시간·진료비·주차·야간응급 안내). 제거 시 `routes.ts`·메뉴·푸터 링크도 정리.

### 4-5. `routes/events.tsx`, `routes/activities/mentoring.tsx`, `routes/membership.tsx`, `routes/familysites.tsx`
- 동창회 행사/멘토링/회비/패밀리사이트는 동물병원 맥락에 안 맞음. **권장 처리:**
  - `events` → "건강검진 프로그램" 또는 "이벤트/소식"으로 전환, 아니면 제거
  - `mentoring` → 제거
  - `membership`(회비) → 제거 또는 "검진/예약 안내"
  - `familysites`(SNU 링크들) → 네이버 블로그/지도/카카오 등으로 교체 또는 제거
  - 라우트 제거 시 `apps/web/app/routes.ts`, 메뉴, 푸터에서 참조도 함께 제거.

### 4-6. 법무/이메일 템플릿 (문자열 치환 위주)
- `routes/privacy.html`, `routes/rules.html`, `routes/email-reject.html`:
  "서울대학교 화학생물공학부 (총)동창회" → "24시 다산 원동물의료센터", 이메일/주소/대표자 갱신.
  (약관 본문 구조는 일반 회원제 약관이라 그대로 두고 주체명만 교체해도 무방. 실제 운영 전 법무 검토 권장.)
- `packages/auth/src/public/forgot-password/email-template.html`: `<h1>` 와 카피라이트의 동창회명 교체.
- `packages/auth/src/public/login/page.tsx`: "동문 네트워크에 로그인하세요." → "회원 로그인" 등 중립 문구.
- `packages/auth/src/admin/users/UserTable.tsx`: "화학생물공학부" 학과 옵션 → 동물병원 맥락엔 불필요할 수 있음(부서/직책 등으로 재정의 또는 제거).

---

## 5. 적용하지 않은 디자인(주의)
단독 HTML 시안의 **메인 투명 헤더 + 홈 아이콘**은 적용 대상 아님:
레포 홈은 40/60 분할(왼쪽만 어두운 히어로, 오른쪽 흰색 콘텐츠)이라 전체폭 투명 헤더가
흰 영역 위에서 안 보입니다. 헤더는 **솔리드 딥 틸 유지**가 자연스럽습니다.
(원하면 `home.tsx` 의 좌측 히어로 컬럼 안에만 떠 있는 오버레이 헤더로 따로 구현 가능 — 별도 작업.)

## 6. 마무리 체크
- [ ] `app.css`, `logo.png` 교체
- [ ] 레포 전체 검색 `동창회`, `서울대`, `화학생물`, `동문`, `snu`, `#30325a`, `#c5a86f` → 잔여 0 확인
- [ ] `pnpm build` / 타입체크 통과
- [ ] 라우트 제거 시 `routes.ts`·메뉴·푸터 링크 정합성 확인
- [ ] 커밋: `git commit -m "rebrand: SNU 동창회 → 24시 다산 원동물의료센터"`
