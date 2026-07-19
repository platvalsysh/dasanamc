import { useEffect } from "react";

/**
 * 사이트 전역 부드러운 스크롤 (Lenis 기반).
 *
 * - 휠/터치 입력을 lerp 보간으로 부드럽게 처리.
 * - Lenis 는 네이티브 scrollTop 을 갱신하므로 motion 의 `useScroll` 과
 *   별도 동기화 코드 없이 호환된다. (구 GSAP ScrollTrigger 동기화 제거)
 * - `prefers-reduced-motion: reduce` 사용자는 Lenis 비활성 (네이티브 스크롤).
 *
 * unmount 시 cleanup — raf 루프 취소 + Lenis destroy. async dynamic
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
    let rafId = 0;

    (async () => {
      const { default: Lenis } = await import("lenis");

      // 이미 unmount 됐다면 setup 중단
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });

      // Lenis 가 스크롤을 갱신할 때마다 ScrollEffects 의 헤더
      // theme/scrolled/darkhero 재계산 (native scroll 이벤트가 매 프레임
      // 발생하지 않아 헤더가 stale 상태로 남는 문제 방지)
      lenis.on("scroll", () => {
        const runFn = (window as unknown as { __dsRunOnScroll?: () => void })
          .__dsRunOnScroll;
        runFn?.();
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
