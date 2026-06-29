import { useEffect, useState } from "react";

/**
 * 다산원 reference 디자인의 우측 고정 quickmenu.
 * 데스크탑(≥980px) 에만 표시, 모바일은 mobile bottom bar 가 대체.
 *
 * 항목: 견적·문의 / 전화상담 / 카톡상담 / 오시는길 / 블로그 / TOP
 */
export function QuickBar() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const items: Array<
    | { kind: "link"; label: string; href: string; external?: boolean }
    | { kind: "tel"; label: string; tel: string }
  > = [
    { kind: "link", label: "견적·문의", href: "/support#contactform" },
    { kind: "tel", label: "전화상담", tel: "0507-1330-5958" },
    { kind: "link", label: "카톡상담", href: "http://pf.kakao.com/", external: true },
    { kind: "link", label: "오시는길", href: "https://map.naver.com/p/search/24%EC%8B%9C%20%EB%8B%A4%EC%82%B0%20%EC%9B%90%EB%8F%99%EB%AC%BC%EC%9D%98%EB%A3%8C%EC%84%BC%ED%84%B0", external: true },
    { kind: "link", label: "블로그", href: "https://blog.naver.com/dasanoneamc", external: true },
  ];

  return (
    <div
      className="hidden min-[980px]:flex fixed right-0 top-1/2 -translate-y-1/2 z-[65] flex-col shadow-[0_12px_30px_rgba(10,21,56,0.22)]"
      aria-label="빠른 메뉴"
    >
      <div className="bg-[color:var(--color-ds-teal)] flex flex-col w-[68px]">
        {items.map((item, idx) => {
          const baseCls =
            "text-white px-1 py-[15px] text-[11.5px] font-bold text-center border-b border-white/15 hover:bg-black/10 transition-colors";
          if (item.kind === "tel") {
            return (
              <a key={idx} href={`tel:${item.tel}`} className={baseCls}>
                {item.label}
              </a>
            );
          }
          if (item.external) {
            return (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={baseCls}
              >
                {item.label}
              </a>
            );
          }
          return (
            <a key={idx} href={item.href} className={baseCls}>
              {item.label}
            </a>
          );
        })}
      </div>
      <button
        type="button"
        onClick={scrollToTop}
        className={
          "bg-[color:var(--color-ds-dark-2)] text-white px-1 py-4 text-[18px] font-bold transition-opacity " +
          (showTop ? "opacity-100" : "opacity-0 pointer-events-none")
        }
        aria-label="맨 위로"
      >
        ↑
      </button>
    </div>
  );
}
