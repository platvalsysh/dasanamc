import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";

/**
 * clip-path 확장 + overlay + 텍스트 이동 hero — motion/react 기반.
 *
 * 레이아웃:
 * - 좌상단: 현재 location breadcrumb (HOME / 병원소개 / 의료진 소개)
 * - 중앙 상단: serif 메인 카피 (+선택 보조 텍스트) — 스크롤 시 중앙으로 이동
 * - 배경: 가운데 작은 창의 이미지가 스크롤에 따라 풀-블리드로 확장
 *
 * pin 은 **CSS `position: sticky`** (라이브러리 무관 — 라우트 전환 안전).
 * 스크럽은 `useScroll` 진행률 + `useSpring` 관성으로 GSAP `scrub: 1` 을 재현.
 * 텍스트 색 전환은 progress 0.34 임계값에서 `data-txt-white` 토글 + CSS transition.
 */

export interface HeroLocationItem {
  label: string;
  /** 링크 경로. 마지막(현재 페이지) 항목은 생략 */
  to?: string;
}

interface StickyBgHeroProps {
  bgImage: string;
  /** 좌상단 현재 위치 breadcrumb — 마지막 항목이 현재 페이지 */
  location?: readonly HeroLocationItem[];
  /** serif 메인 카피 — `\n` 줄바꿈 지원 */
  copy: string;
  /** 카피 아래 보조 텍스트 (선택) */
  sub?: string;
  /** 콘텐츠가 얕은 페이지용 — 스크롤 트랙을 200vh 로 줄임 (기본 300vh) */
  compact?: boolean;
}

export function StickyBgHero({ bgImage, location, copy, sub, compact = false }: StickyBgHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const txtWrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // 초기 이미지 창 인셋 + 텍스트 중앙 이동량 — 마운트 시 실측 (SSR 은 데스크톱 기본값)
  const [inset, setInset] = useState({ top: 55, side: 13 });
  const [textShift, setTextShift] = useState(0);

  useEffect(() => {
    const measure = () => {
      setInset(
        window.innerWidth < 768 ? { top: 60, side: 6 } : { top: 55, side: 13 },
      );
      const wrap = txtWrapRef.current;
      const inner = wrap?.querySelector<HTMLElement>(".sb-txt-inner");
      if (wrap && inner) {
        const vh = window.innerHeight || 800;
        const padTop = parseFloat(getComputedStyle(wrap).paddingTop || "0");
        setTextShift(Math.max(0, (vh - inner.offsetHeight) / 2 - padTop));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // 섹션 스크롤 진행률 (0 = 상단 도달, 1 = 트랙 끝) + scrub 관성
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // 배경 clip-path — progress 0→0.5 동안 창이 풀-블리드로 확장
  const clipPath = useTransform(progress, (v) => {
    const t = Math.min(Math.max(v / 0.5, 0), 1);
    const top = inset.top * (1 - t);
    const side = inset.side * (1 - t);
    return `inset(${top}% ${side}% 0% ${side}%)`;
  });
  // 다크 overlay 0→0.5 페이드인
  const overlayOpacity = useTransform(progress, [0, 0.5], [0, 1]);
  // 텍스트 블록 — viewport 세로 정중앙까지 이동
  const textY = useTransform(progress, [0, 0.5], [0, textShift]);
  // exit fade — hero 이탈 직전 텍스트·breadcrumb 제거 (헤더와 겹침 방지)
  const exitOpacity = useTransform(progress, [0.9, 1], [1, 0]);

  // 헤더 테마(data-bg-full) + 텍스트 흰색 전환(data-txt-white) — 임계값 토글.
  // 스프링 관성이 마지막 scroll 이벤트 이후에 임계값을 넘을 수 있으므로,
  // 값이 바뀌면 ScrollEffects 의 헤더 재계산을 직접 호출해 stale 방지.
  useMotionValueEvent(progress, "change", (v) => {
    const pin = pinRef.current;
    if (!pin) return;
    const bgFull = v > 0.45 ? "1" : "0";
    if (pin.getAttribute("data-bg-full") !== bgFull) {
      pin.setAttribute("data-bg-full", bgFull);
      (window as unknown as { __dsRunOnScroll?: () => void }).__dsRunOnScroll?.();
    }
    pin.setAttribute("data-txt-white", v > 0.34 ? "1" : "0");
  });

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        background: "#ffffff",
        // compact: 확장 1/2 viewport + 짧은 hold (얕은 페이지용)
        height: compact ? "200vh" : "300vh",
      }}
      aria-label={copy}
    >
      <div
        ref={pinRef}
        className="sb-pin darkhero sticky top-0 h-screen w-full overflow-hidden"
        data-bg-full={reduced ? "1" : "0"}
        data-txt-white={reduced ? "1" : "0"}
      >
        {/* 이미지 + overlay — clip-path 로 마스킹되는 wrapper */}
        <motion.div
          className="sb-img-wrap absolute inset-0"
          style={reduced ? undefined : { clipPath, willChange: "clip-path" }}
        >
          <div
            className="sb-bg absolute inset-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center 38%",
              backgroundRepeat: "no-repeat",
              // 사진별 색감 편차를 줄이는 브랜드 듀오톤 베이스
              filter: "saturate(0.82)",
            }}
          />
          {/* 상시 teal wash — 스톡/실촬영 혼용 시 톤 통일 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(150deg, rgba(9,45,40,0.30) 0%, rgba(9,45,40,0.14) 55%, rgba(9,45,40,0.26) 100%)",
            }}
          />
          <motion.div
            className="sb-overlay absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg,rgba(8,34,29,0.45) 0%,rgba(6,30,26,0.55) 45%,rgba(4,22,19,0.68) 100%)",
              opacity: reduced ? 1 : overlayOpacity,
            }}
          />
        </motion.div>

        {/* 좌상단 location breadcrumb — 헤더 아래 고정 (카피와 함께 이동하지 않음) */}
        {location && location.length > 0 && (
          <motion.nav
            aria-label="현재 위치"
            className="sb-loc absolute z-[4] flex items-center flex-wrap gap-x-2.5 gap-y-1"
            style={{
              top: 104,
              left: "clamp(24px, 4vw, 64px)",
              right: "clamp(24px, 4vw, 64px)",
              opacity: reduced ? 1 : exitOpacity,
            }}
          >
            <Link
              to="/"
              aria-label="메인페이지"
              title="메인페이지"
              className="sb-text flex items-center hover:opacity-70 transition-opacity"
              style={{ color: "#6f7d79" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V20h14V9.5" />
              </svg>
            </Link>
            {location.map((item) => (
              <span key={item.label} className="flex items-center gap-x-2.5">
                <span
                  aria-hidden
                  className="sb-text"
                  style={{ fontSize: 10, color: "#c4cec9" }}
                >
                  /
                </span>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="sb-text hover:opacity-70 transition-opacity"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      lineHeight: 1,
                      letterSpacing: "-0.01em",
                      color: "#6f7d79",
                    }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="sb-text"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "-0.01em",
                      color: "var(--color-ds-dark-warm)",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </motion.nav>
        )}

        {/* serif 메인 카피 — 상단 18vh, 스크롤 진행에 따라 중앙으로 이동 */}
        <motion.div
          ref={txtWrapRef}
          className="sb-txt-wrap absolute inset-0 flex flex-col items-center text-center px-8 pointer-events-none"
          style={{
            paddingTop: "clamp(140px, 20vh, 240px)",
            willChange: "transform",
            y: reduced ? 0 : textY,
            opacity: reduced ? 1 : exitOpacity,
          }}
        >
          {/* 이동량 계산용 inner — 콘텐츠 실측 높이 기준으로 중앙 정렬 */}
          <div className="sb-txt-inner flex flex-col items-center">
            <h1
              className="sb-text serif font-semibold max-w-[900px]"
              style={{
                fontSize: "clamp(30px, 4.2vw, 56px)",
                lineHeight: 1.45,
                letterSpacing: "-0.02em",
                color: "var(--color-ds-dark-warm)",
                whiteSpace: "pre-line",
                textWrap: "balance",
              }}
            >
              {copy}
            </h1>
            {sub && (
              <p
                className="sb-text mt-6 max-w-[640px] text-[16px]"
                style={{ color: "#5c6b68", lineHeight: 1.7 }}
              >
                {sub}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
