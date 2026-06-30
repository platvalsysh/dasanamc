import { useEffect, useState } from "react";

/**
 * 우측 하단 floating quick menu (데스크탑 ≥980px).
 * 모바일은 `MobileBar` 가 대체.
 *
 * 항목: 전화상담(teal 원형) / 카톡상담(흰 원형) / 맨위로(다크 원형).
 * 레퍼런스 DasanoneSite.dc.html 의 `.quickmenu` 구현.
 */
export function QuickBar() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const circleBase: React.CSSProperties = {
    width: 54,
    height: 54,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
  };

  return (
    <div
      className="hidden min-[980px]:flex fixed z-[65] flex-col gap-2.5"
      style={{ right: 22, bottom: 24 }}
      aria-label="빠른 메뉴"
    >
      <a
        href="tel:0507-1330-5958"
        title="전화상담"
        style={{
          ...circleBase,
          background: "#0e9d8c",
          color: "#fff",
          boxShadow: "0 10px 24px rgba(13,58,53,0.28)",
        }}
      >
        📞
      </a>
      <a
        href="http://pf.kakao.com/"
        target="_blank"
        rel="noreferrer"
        title="카톡상담"
        style={{
          ...circleBase,
          background: "#fff",
          color: "#0d3a35",
          border: "1px solid #e7ece8",
          boxShadow: "0 10px 24px rgba(13,58,53,0.14)",
        }}
      >
        💬
      </a>
      <button
        type="button"
        onClick={scrollToTop}
        title="맨 위로"
        style={{
          ...circleBase,
          background: "#0d3a35",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
          fontFamily: "inherit",
          boxShadow: "0 10px 24px rgba(13,58,53,0.28)",
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? "auto" : "none",
          transition: "opacity .2s",
        }}
        aria-label="맨 위로"
      >
        ↑
      </button>
    </div>
  );
}
