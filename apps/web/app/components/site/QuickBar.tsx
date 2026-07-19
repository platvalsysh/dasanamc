import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PenSquare, Headset, MessageCircle, MapPin, ArrowUp } from "lucide-react";

/**
 * 우측 고정 사각 quick 메뉴 (brainall.kr 스타일).
 *
 * - solid 다크 teal 사각 컬럼 (radius 없음, flat)
 * - 항목: 아이콘 + 라벨 세로 스택, hover 시 라벨 밑줄이 좌→우로 채워짐
 * - 하단에 분리된 다크 사각 TOP 버튼
 * - 데스크탑(≥980px) 전용 — 모바일은 MobileBar 가 대체
 */
export function QuickBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const items: Array<
    | { kind: "link"; label: string; to: string; icon: React.ReactNode }
    | { kind: "a"; label: string; href: string; external?: boolean; icon: React.ReactNode }
  > = [
    { kind: "link", label: "온라인 문의", to: "/support/contact", icon: <PenSquare size={26} strokeWidth={1.7} /> },
    { kind: "a", label: "전화 상담", href: "tel:0507-1330-5958", icon: <Headset size={26} strokeWidth={1.7} /> },
    { kind: "a", label: "카톡 상담", href: "http://pf.kakao.com/", external: true, icon: <MessageCircle size={26} strokeWidth={1.7} /> },
    {
      kind: "a",
      label: "오시는 길",
      href: "https://map.naver.com/p/search/%EB%82%A8%EC%96%91%EC%A3%BC%20%EB%8B%A4%EC%82%B0%EC%9B%90%EB%8F%99%EB%AC%BC%EC%9D%98%EB%A3%8C%EC%84%BC%ED%84%B0",
      external: true,
      icon: <MapPin size={26} strokeWidth={1.7} />,
    },
  ];

  const itemCls =
    "qb-item flex flex-col items-center justify-center gap-2 w-full py-5 text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]";
  const labelCls = "qb-label relative text-[12px] font-semibold leading-none";

  return (
    <div
      className="hidden min-[980px]:flex fixed z-[65] flex-col"
      style={{
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: 88,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity .3s",
      }}
      aria-label="빠른 메뉴"
    >
      {/* 메뉴 컬럼 — solid 다크 teal 사각 */}
      <div className="flex flex-col" style={{ background: "var(--color-ds-dark-warm)" }}>
        {items.map((item) =>
          item.kind === "link" ? (
            <Link key={item.label} to={item.to} className={itemCls}>
              {item.icon}
              <span className={labelCls}>{item.label}</span>
            </Link>
          ) : (
            <a
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className={itemCls}
            >
              {item.icon}
              <span className={labelCls}>{item.label}</span>
            </a>
          ),
        )}
      </div>

      {/* TOP — 분리된 다크 사각 */}
      <button
        type="button"
        onClick={scrollToTop}
        className="flex items-center justify-center w-full text-white cursor-pointer transition-colors hover:bg-[#04201d]"
        style={{
          height: 64,
          marginTop: 6,
          background: "#1a2420",
          border: "none",
        }}
        aria-label="맨 위로"
      >
        <ArrowUp size={22} strokeWidth={2} />
      </button>
    </div>
  );
}
