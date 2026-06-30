import { useEffect } from "react";

/**
 * 다산원 reference 디자인의 스크롤 효과를 한 곳에서 처리.
 *
 * 1. 상단 2px 진행률 바: `--scroll` CSS var 를 0~1 로 업데이트.
 *    `#scrollbar` 가 그 값을 받아 width 갱신.
 * 2. 헤더 자동 숨김: 스크롤 다운 시 `#siteheader[data-hidden="1"]`,
 *    스크롤 업/상단 근처에서 풀림. 8px 넘으면 `data-scrolled="1"`.
 * 3. Hero pin 효과: 홈의 `#heropin` 이 220vh 차지하도록 `--pinH` 설정.
 *    그 안에서 hero text 가 스크롤 진행률에 따라 4개 문구로 swap.
 * 4. Reveal/Stagger 등장 애니메이션: `[data-reveal]`, `[data-stagger]` 가
 *    뷰포트에 들어올 때 `data-inview="1"` 부여 → CSS 가 페이드/슬라이드 처리.
 *
 * `prefers-reduced-motion: reduce` 면 pin 을 100vh 로 두고 reveal/stagger 도
 * 바로 inview 처리 → 모션 거부 사용자도 콘텐츠는 동일하게 보임.
 */

const HERO_PHRASES = [
  "수준 높은 의료 서비스",
  "365일 24시간 응급케어",
  "대학병원급 정밀 진단",
  "분과 협진 원스톱 케어",
];

const HERO_THRESHOLDS = [0, 0.25, 0.5, 0.75];

export function ScrollEffects() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const doc = document.documentElement;

    const motionOn =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: no-preference)").matches;

    // hero pin 길이
    doc.style.setProperty("--pinH", motionOn ? "220vh" : "100vh");

    // Reveal/Stagger 관찰자
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  e.target.setAttribute("data-inview", "1");
                  io?.unobserve(e.target);
                }
              });
            },
            { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
          )
        : null;

    const seen = new WeakSet<Element>();
    const scan = () => {
      const targets = document.querySelectorAll(
        "[data-reveal]:not([data-inview]), [data-stagger]:not([data-inview])",
      );
      targets.forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (!io || !motionOn) {
          el.setAttribute("data-inview", "1");
          return;
        }
        const r = el.getBoundingClientRect();
        // 화면 상단 92% 안에 있으면 즉시 inview
        if (r.top < (window.innerHeight || 0) * 0.92) {
          el.setAttribute("data-inview", "1");
          return;
        }
        io.observe(el);
      });
    };

    // 처음 한 번 + 라우트 전환에 대비한 mutation observer
    scan();
    const mo = new MutationObserver(() => {
      scan();
      // 라우트 전환으로 centertrack 이 새로 마운트되면 다시 바인딩
      const t = document.getElementById("centertrack") as HTMLElement | null;
      if (t && !(t as any)._wheelBound) {
        bindCenterTrack();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // 안전망: 1.6초 후 남은 reveal/stagger 강제 inview
    const fallback = setTimeout(() => {
      document
        .querySelectorAll(
          "[data-reveal]:not([data-inview]), [data-stagger]:not([data-inview])",
        )
        .forEach((el) => el.setAttribute("data-inview", "1"));
    }, 1600);

    // 가로 스크롤 트랙(SPECIALTY CENTERS) — 휠을 가로 스크롤로 변환
    const bindCenterTrack = () => {
      const t = document.getElementById("centertrack") as HTMLElement | null;
      if (!t || (t as any)._wheelBound) return;
      (t as any)._wheelBound = true;
      t.addEventListener(
        "wheel",
        (e: WheelEvent) => {
          if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
          const atStart = t.scrollLeft <= 0;
          const atEnd = t.scrollLeft >= t.scrollWidth - t.clientWidth - 1;
          if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
          t.scrollLeft += e.deltaY;
          e.preventDefault();
        },
        { passive: false },
      );
    };
    bindCenterTrack();

    // hero 텍스트 swap 헬퍼
    let lastHeroIdx = -1;
    const updateHeroText = (prog: number) => {
      const el = document.getElementById("heroswap");
      if (!el) return;
      let idx = 0;
      for (let i = 0; i < HERO_PHRASES.length; i++) {
        if (prog >= (HERO_THRESHOLDS[i] ?? 1)) idx = i;
      }
      idx = Math.min(idx, HERO_PHRASES.length - 1);
      if (lastHeroIdx === idx) return;
      lastHeroIdx = idx;
      el.textContent = HERO_PHRASES[idx];
      el.classList.remove("swapping");
      // reflow trick → 재시작
      void (el as HTMLElement).offsetWidth;
      el.classList.add("swapping");
    };

    // 스크롤 핸들러
    let lastY = window.scrollY || 0;
    const onScroll = () => {
      const y = window.scrollY || 0;
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      doc.style.setProperty(
        "--scroll",
        Math.min(1, Math.max(0, y / max)).toFixed(4),
      );

      // hero pin 진행률 → 텍스트 swap
      if (motionOn) {
        const pin = document.getElementById("heropin");
        if (pin) {
          const dist = pin.offsetHeight - window.innerHeight || 1;
          const prog = Math.min(
            1,
            Math.max(0, -pin.getBoundingClientRect().top / dist),
          );
          updateHeroText(prog);
        }
      }

      // 헤더 theme(dark/light) + scrolled
      const header = document.getElementById("siteheader");
      if (header) {
        // 다크 hero 영역이 헤더(78px) 아래로 사라지면 light, 아니면 dark
        const dh = document.querySelector(".darkhero");
        const overHero = dh
          ? (dh as HTMLElement).getBoundingClientRect().bottom > 84
          : false;
        header.setAttribute("data-theme", overHero ? "dark" : "light");
        header.setAttribute("data-scrolled", y > 8 ? "1" : "0");
        // hide-on-scroll-down 비활성: 헤더는 항상 sticky 유지
        header.setAttribute("data-hidden", "0");
      }
      lastY = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(fallback);
      io?.disconnect();
      mo.disconnect();
    };
  }, []);

  // 페이지 상단 진행률 바 (CSS 가 width 처리)
  return <div id="scrollbar" />;
}
