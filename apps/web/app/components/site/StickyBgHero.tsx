import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * clip-path 확장 + overlay + 텍스트 이동 hero.
 *
 * 레이아웃:
 * - 좌상단: 현재 location breadcrumb (HOME / 병원소개 / 의료진 소개)
 * - 중앙 상단: serif 메인 카피 (+선택 보조 텍스트) — 스크롤 시 중앙으로 이동
 * - 배경: 가운데 작은 창의 이미지가 스크롤에 따라 풀-블리드로 확장
 *
 * pin 은 GSAP `pin:true` 가 아니라 **CSS `position: sticky`** 로 구현.
 * (GSAP pin 은 spacer DOM 조작 → React 라우트 전환 시 removeChild 에러)
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
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(ScrollTrigger);

    const pinInner = section.querySelector<HTMLDivElement>(".sb-pin")!;
    const imgWrap = section.querySelector<HTMLDivElement>(".sb-img-wrap")!;
    const overlay = section.querySelector<HTMLDivElement>(".sb-overlay")!;
    const txtWrap = section.querySelector<HTMLDivElement>(".sb-txt-wrap")!;
    const txtEls = section.querySelectorAll<HTMLElement>(".sb-text");

    if (prefersReduced) {
      gsap.set(imgWrap, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(overlay, { opacity: 1 });
      txtEls.forEach((el) => (el.style.color = "#ffffff"));
      pinInner.setAttribute("data-bg-full", "1");
      return;
    }

    pinInner.setAttribute("data-bg-full", "0");

    // 초기 이미지 창 — 모바일은 좌우 여백을 줄여 창이 너무 좁아지지 않게
    const startInset =
      window.innerWidth < 768 ? "inset(60% 6% 0 6%)" : "inset(55% 13% 0 13%)";

    const ctx = gsap.context(() => {
      gsap.set(imgWrap, {
        clipPath: startInset,
        webkitClipPath: startInset,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            pinInner.setAttribute(
              "data-bg-full",
              self.progress > 0.45 ? "1" : "0",
            );
          },
        },
      });

      tl.fromTo(
        imgWrap,
        {
          clipPath: startInset,
          webkitClipPath: startInset,
        },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          webkitClipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          immediateRender: false,
          duration: 0.5,
        },
      )
        .fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 1, ease: "none", duration: 0.5 },
          0,
        )
        .fromTo(
          txtWrap,
          { y: 0 },
          {
            // 스크롤 완료 시 텍스트 블록이 viewport 세로 정중앙에 오도록,
            // 초기 paddingTop 과 실제 콘텐츠 높이를 실측해 이동량 계산.
            y: () => {
              const vh = window.innerHeight || 800;
              const inner =
                txtWrap.querySelector<HTMLElement>(".sb-txt-inner");
              if (!inner) return vh * 0.26;
              const padTop = parseFloat(
                getComputedStyle(txtWrap).paddingTop || "0",
              );
              const target = (vh - inner.offsetHeight) / 2 - padTop;
              return Math.max(0, target);
            },
            ease: "none",
            duration: 0.5,
          },
          0,
        )
        // 텍스트 색 — 배경이 어느 정도 채워진 후(progress 0.28)부터 빠르게 흰색으로
        .to(
          txtEls,
          { color: "#ffffff", ease: "none", duration: 0.22 },
          0.28,
        )
        // hold — 풀-블리드 상태에서 추가 스크롤 동안 머무름
        .to({}, { duration: 0.5 })
        // exit fade — hero 가 빠져나가기 직전 텍스트·breadcrumb 을 지워
        // 헤더/로고와 겹쳐 보이는 프레임 방지
        .to(
          [txtWrap, section.querySelector(".sb-loc")].filter(Boolean),
          { opacity: 0, ease: "none", duration: 0.1 },
          0.9,
        );
    }, section);

    return () => ctx.revert();
  }, []);

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
        className="sb-pin darkhero sticky top-0 h-screen w-full overflow-hidden"
        data-bg-full="0"
      >
        {/* 이미지 + overlay — clip-path 로 마스킹되는 wrapper */}
        <div
          className="sb-img-wrap absolute inset-0"
          style={{ willChange: "clip-path" }}
        >
          <div
            className="sb-bg absolute inset-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center 38%",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div
            className="sb-overlay absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg,rgba(8,34,29,0.45) 0%,rgba(6,30,26,0.55) 45%,rgba(4,22,19,0.68) 100%)",
              opacity: 0,
            }}
          />
        </div>

        {/* 좌상단 location breadcrumb — 헤더 아래 고정 (카피와 함께 이동하지 않음) */}
        {location && location.length > 0 && (
          <nav
            aria-label="현재 위치"
            className="sb-loc absolute z-[4] flex items-center flex-wrap gap-x-2.5 gap-y-1"
            style={{
              top: 104,
              left: "clamp(24px, 4vw, 64px)",
              right: "clamp(24px, 4vw, 64px)",
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
                      color: "#0d3a35",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* serif 메인 카피 — 상단 18vh, 스크롤 진행에 따라 중앙으로 이동 */}
        <div
          className="sb-txt-wrap absolute inset-0 flex flex-col items-center text-center px-8 pointer-events-none"
          style={{
            paddingTop: "clamp(140px, 20vh, 240px)",
            willChange: "transform",
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
                color: "#0d3a35",
                transition: "none",
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
        </div>
      </div>
    </section>
  );
}
