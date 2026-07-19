# Design System Master File — 24시 다산 원동물의료센터

> **LOGIC:** 특정 페이지 작업 시 `design-system/dasanamc/pages/[page-name].md` 를 먼저 확인.
> 있으면 그 규칙이 이 파일을 **override**. 없으면 아래 규칙을 엄격히 따른다.
>
> 이 문서는 실제 구현([apps/web/app/app.css](../../apps/web/app/app.css) `@theme`)과 동기화된
> 프로젝트 소스 오브 트루스다. 토큰 값 변경은 **app.css 가 원본**이고 이 문서를 따라 갱신한다.

---

**Project:** dasanamc (외주 홈페이지 템플릿 — 동물병원 인스턴스)
**Category:** Veterinary Clinic / 24h Emergency
**Stack:** React Router 7 + Tailwind CSS v4 (`@theme` 토큰) + GSAP ScrollTrigger + Lenis
**Updated:** 2026-07-19

---

## 컨셉

**"기록으로 증명하는 신뢰"** — 다크 teal 의 의료 전문성 + serif 감성 카피 + 실촬영
사진. 장식보다 실제 치료 기록(케이스 아카이브·의료진·시설)이 전문성의 증거.

- 무드: 신뢰, 침착함, 대학병원급 전문성, 따뜻한 동행
- 금지: AI 퍼플/핑크 그라데이션, 이모지 아이콘, 일반적인 병원 템플릿 클리셰

## Color Palette (app.css `@theme` 와 1:1)

| Role | Hex | CSS Variable | 용도 |
|------|-----|--------------|------|
| Primary accent | `#0e9d8c` | `--color-ds-teal` | 장식·대형 숫자·보더 등 (24px+ 대형 전용) |
| **CTA / 소형 라벨** | `#0a7468` | `--color-ds-teal-deep` | **흰 글자 CTA 배경(4.6:1)·흰 배경 위 라벨(4.5:1)** |
| On-dark accent | `#56c8b8` | `--color-ds-teal-2` | 다크 배경 위 라벨·숫자 |
| On-dark bright | `#6ed4c5` | `--color-ds-teal-3` | 다크 배경 위 강조·링크 |
| Dark hero base | `#06201c` | `--color-ds-dark` | 홈 hero |
| Dark section | `#062b28` | `--color-ds-dark-2` | 통계·푸터 |
| Dark deepest | `#041815` | `--color-ds-dark-3` | hero 최심부 |
| Dark warm | `#0d3a35` | `--color-ds-dark-warm` | 다크 카드·hover 반전·본문 제목색 |
| Bento card | `#f4f7f6` | `--color-ds-bento` | 라이트 카드 배경 |
| Text | `#0d3a35` | `--color-ds-text` | 제목·본문 강조 |
| Text sub | `#5c6b68` | `--color-ds-text-sub` | 본문 보조 (흰 배경 4.7:1) |
| Border | `#e7ece8` | `--color-ds-border` | 헤어라인 |
| Emergency red | `#c2504a` | (인라인) | 응급 신호 번호 등 제한적 사용 |

**규칙**
- 컴포넌트에 raw hex 금지 — 반드시 `var(--color-ds-*)`. 인라인 style 은
  `"var(--color-ds-bento)"`, Tailwind arbitrary 는 `bg-[color:var(--color-ds-dark-warm)]`.
- `--color-ds-teal`(#0e9d8c)은 **소형 텍스트·CTA 에 사용 금지** (흰 글자 3.38:1 미달).
  그 자리는 항상 `--color-ds-teal-deep`.

## Typography

| 역할 | 폰트 | 규칙 |
|------|------|------|
| 본문/UI | Pretendard (Spoqa Han Sans Neo 폴백) | `--font-sans`, 기본 16px, line-height 1.6, `word-break: keep-all` |
| 감성 카피 | Noto Serif + Noto Serif KR (가변 200~900) | `.serif` 유틸. hero 카피 **weight 600** |
| eyebrow/번호 | `ui-monospace` | 700 13px, letter-spacing 0.2~0.24em, 색 teal-deep(라이트)/teal-2(다크) |

- 본문 최소 15px, 메타·태그 최소 12px. 12px 미만 금지.
- hero 카피: `clamp(30px, 4.2vw, 56px)` (StickyBgHero) / 홈 `clamp(38px, 5.8vw, 78px)`
- 대형 숫자: `ui-monospace` 800, clamp 34~104px

## Layout & Spacing

- 컨테이너: `max-w-[1280px] px-8` (본문 좁은 페이지 1080px, 와이드 1320px)
- 섹션 상하: `py-24` 기본, 임팩트 섹션 `py-[104px]`
- 카드 radius: **20px(소형·리스트) / 24px(대형 bento)** 2단계만
- bento 그리드 gap: 20px (`gap-5`), 카드 패딩 36~48px

## Motion — 라이브러리는 motion/react 단일

- 전역: Lenis smooth scroll (reduced-motion 시 비활성, 자체 raf 루프)
- 서브페이지 hero: StickyBgHero — CSS sticky + `useScroll`/`useSpring`/`useTransform`
  clip-path 확장 스크럽. 헤더 연동은 `data-bg-full`, 텍스트 흰색 전환은
  `data-txt-white` + CSS transition
- 홈 hero 진입: `Rise`(계단 fade+rise, serif 는 blur 옵션) · 통계는 `CountUp`
  — [motion-bits.tsx](../../apps/web/app/components/site/motion-bits.tsx)
- 카드 reveal: `data-stagger` + `data-reveal` (ScrollEffects, vanilla)
- hover: 색 반전(→ dark-warm) 또는 사진 줌(scale 1.04~1.06, 500~700ms), translateY(-4px)
- **gsap 사용 금지** (2026-07 제거 — CJS 배포라 Vercel Node ESM 크래시 이력)
- **모든 CSS 장식 애니메이션은 `prefers-reduced-motion` 에서 정지** (app.css 전역 처리됨)

## 접근성 기준선 (구현 완료 — 회귀 금지)

- 텍스트 대비 4.5:1 (대형 3:1) — teal-deep/text-sub 토큰으로 보장
- `:focus-visible` teal 포커스 링 (app.css 전역)
- skip link "본문 바로가기" (default layout)
- 터치 타깃: 링크·버튼 40px+ (푸터 연락처 py-2.5 패턴)
- 이미지 alt 필수, 장식 이미지는 `aria-hidden`
- 아이콘: lucide-react 만 (이모지 금지)

## 사진 처리

- 실촬영본 우선 (`/images/facility`, `/images/doctors`, `/images/cases`)
- 스톡 혼용 시 StickyBgHero 의 듀오톤(saturate 0.82 + teal wash)이 톤 통일
- 신규 이미지는 최대 1600px, jpeg 품질 ~78 로 재인코딩 후 커밋

## Pre-Delivery Checklist

- [ ] raw hex 대신 `var(--color-ds-*)` 사용했는가
- [ ] 소형 텍스트에 `--color-ds-teal` 을 쓰지 않았는가 (→ teal-deep)
- [ ] 본문 15px+, 메타 12px+ 인가
- [ ] radius 20/24 둘 중 하나인가
- [ ] hover 전환 150~300ms + cursor-pointer 인가
- [ ] reduced-motion·focus-visible·alt 를 깨지 않았는가
- [ ] 모바일 375px 에서 가로 스크롤 없는가
- [ ] 375 / 768 / 1024 / 1440 확인했는가
