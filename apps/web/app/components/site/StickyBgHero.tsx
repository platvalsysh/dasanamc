import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * clip-path 확장 + overlay + 텍스트 이동 hero.
 *
 * pin 을 GSAP `pin:true` 가 아니라 **CSS `position: sticky`** 로 구현.
 * 이유: GSAP `pin` 은 pinned 요소를 spacer div 로 감싸는 DOM 조작을 하는데,
 * React SPA 라우트 전환 시 React 가 자기 트리에 없는 spacer 노드를 만나
 * `removeChild` NotFoundError 를 던짐. CSS sticky 는 DOM 조작이 없어 React 와
 * 충돌 없음.
 *
 * 구조:
 *   <section h=300vh>           ← 스크롤 영역 (2 viewport 진행 + 1 buffer)
 *     <div sticky h=100vh>      ← 화면에 pin (CSS)  = .darkhero
 *       <img-wrap clip-path>    ← GSAP 로 변화
 *       <overlay>               ← GSAP 로 opacity
 *       <txt-wrap>              ← GSAP 로 translateY + color
 */
interface StickyBgHeroProps {
  bgImage: string;
  /** 상단 mono 태그. 생략 시 렌더 안 함 */
  tag?: string;
  /** 큰 산세리프 타이틀. 생략 시 subtitle 이 serif 메인 카피로 커짐 */
  title?: string;
  /** 서브 카피. tag/title 없을 땐 이게 hero 의 메인 카피 */
  subtitle?: string;
}

export function StickyBgHero({ bgImage, tag, title, subtitle }: StickyBgHeroProps) {
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
      txtEls.forEach((el) => (el.style.color = "#f4efe6"));
      pinInner.setAttribute("data-bg-full", "1");
      return;
    }

    pinInner.setAttribute("data-bg-full", "0");

    // gsap.context — 언마운트 시 ctx.revert() 로 모든 트윈/ScrollTrigger 정리.
    // pin 옵션이 없으므로 spacer DOM 조작이 애초에 없어 안전.
    const ctx = gsap.context(() => {
      gsap.set(imgWrap, {
        clipPath: "inset(55% 13% 0 13%)",
        webkitClipPath: "inset(55% 13% 0 13%)",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // section 이 300vh 라 200vh 동안 progress 0→1 (2 viewport 스크롤)
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
          clipPath: "inset(55% 13% 0 13%)",
          webkitClipPath: "inset(55% 13% 0 13%)",
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
          { y: "26vh", ease: "none", duration: 0.5 },
          0,
        )
        // 텍스트 색 — 배경이 어느 정도 채워진 후(progress 0.28)부터 빠르게 흰색으로
        .to(
          txtEls,
          { color: "#ffffff", ease: "none", duration: 0.22 },
          0.28,
        )
        // hold — 풀-블리드 상태에서 추가 스크롤 동안 머무름
        .to({}, { duration: 0.5 });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        background: "#ffffff",
        height: "300vh", // 2 viewport 스크롤 영역 + 여유
      }}
      aria-label={title}
    >
      {/*
       * CSS sticky pin — React 트리에 그대로 남으므로 unmount 시 removeChild 에러 없음.
       * `.darkhero` 클래스를 여기에 부여해 ScrollEffects 가 헤더 dark/light 판단.
       */}
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

        {/*
         * 텍스트 — clip-path 위에 떠 있음.
         * 초기 상단 18vh, 스크롤 진행에 따라 translateY 26vh → viewport 중앙.
         */}
        <div
          className="sb-txt-wrap absolute inset-0 flex flex-col items-center text-center px-8 pointer-events-none"
          style={{
            paddingTop: "clamp(110px, 18vh, 220px)",
            willChange: "transform",
          }}
        >
          {tag && (
            <div
              className="sb-text mb-5"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.22em",
                color: "#0e9d8c",
              }}
            >
              {tag}
            </div>
          )}
          {title && (
            <h1
              className="sb-text font-extrabold"
              style={{
                fontSize: "clamp(44px, 6.5vw, 80px)",
                letterSpacing: "-0.035em",
                lineHeight: 1.02,
                color: "#0d3a35",
                transition: "none",
              }}
            >
              {title}
            </h1>
          )}
          {subtitle &&
            (title || tag ? (
              // 보조 카피 (기존 스타일)
              <p
                className="sb-text mt-6 max-w-[640px] text-[17px]"
                style={{ color: "#5c6b68", lineHeight: 1.7 }}
              >
                {subtitle}
              </p>
            ) : (
              // subtitle 이 메인 카피 — serif + 큰 사이즈
              <h1
                className="sb-text serif font-medium max-w-[900px]"
                style={{
                  fontSize: "clamp(32px, 4.4vw, 60px)",
                  lineHeight: 1.45,
                  letterSpacing: "-0.02em",
                  color: "#0d3a35",
                  transition: "none",
                  whiteSpace: "pre-line",
                  textWrap: "balance",
                }}
              >
                {subtitle}
              </h1>
            ))}
        </div>
      </div>
    </section>
  );
}
