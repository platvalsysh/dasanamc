import { useEffect } from "react";

/**
 * 사이트 전역 부드러운 스크롤 (Lenis 기반).
 *
 * - 휠/터치 입력을 lerp 보간으로 부드럽게 처리.
 * - GSAP ScrollTrigger 와 동기화 — Lenis 의 가상 scroll 위치를 ScrollTrigger 가
 *   읽도록 raf 루프에서 `ScrollTrigger.update()` 호출.
 * - `prefers-reduced-motion: reduce` 사용자는 Lenis 비활성 (네이티브 스크롤).
 *
 * unmount 시 cleanup — Lenis destroy + GSAP ticker 등록 해제. async dynamic
 * import 의 race condition 방지를 위해 `cancelled` 플래그 사용.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let cancelled = false;
    let lenis: import("lenis").default | null = null;
    let gsapRef: typeof import("gsap").gsap | null = null;
    let scrollHandler: (() => void) | null = null;
    let tickerFn: ((time: number) => void) | null = null;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

      // 이미 unmount 됐다면 setup 중단
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;

      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });

      // Lenis 가 스크롤을 갱신할 때마다:
      //  1) GSAP ScrollTrigger 진행률 업데이트
      //  2) ScrollEffects 의 헤더 theme/scrolled/darkhero 재계산 (native scroll
      //     이벤트가 매 프레임 발생하지 않아 헤더가 stale 상태로 남는 문제 방지)
      scrollHandler = () => {
        ScrollTrigger.update();
        const runFn = (window as unknown as { __dsRunOnScroll?: () => void })
          .__dsRunOnScroll;
        runFn?.();
      };
      lenis.on("scroll", scrollHandler);

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      // pin spacer 등으로 변한 scrollHeight 반영
      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      if (gsapRef && tickerFn) {
        gsapRef.ticker.remove(tickerFn);
      }
      if (lenis && scrollHandler) lenis.off("scroll", scrollHandler);
      lenis?.destroy();
      lenis = null;
      tickerFn = null;
      scrollHandler = null;
    };
  }, []);

  return null;
}
