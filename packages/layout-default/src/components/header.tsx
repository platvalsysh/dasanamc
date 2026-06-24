import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useAuth, checkUserPermissions, useIsAdmin } from "@repo/auth/ui";
import { Menu, X, Settings, User, LogIn, LogOut } from "lucide-react";
import type { SiteMenuConfigItem } from "@repo/core/types";

/**
 * 다산원동물의료센터 헤더.
 *
 * Reference 디자인 (design_handoff_dasanone/reference) 매핑:
 * - 홈 페이지 상단: 다크 히어로 위에 떠있는 "투명" 헤더 (흰 로고/흰 메뉴)
 * - 스크롤 다운 또는 home 외 라우트: 흰 배경 / 어두운 로고 / 어두운 메뉴
 * - 좌측: 로고 (홈 링크) / 가운데: 홈 아이콘 + 메뉴 / 우측: 24시 전화 CTA pill
 */

const MENU_ITEMS_FALLBACK: SiteMenuConfigItem[] = [
  {
    id: "about",
    label: "병원소개",
    to: "/about/greeting",
    children: [
      { id: "about-greeting", label: "대표원장 인사말", to: "/about/greeting" },
      { id: "about-info", label: "진료안내", to: "/about/info" },
      { id: "about-contact", label: "오시는 길", to: "/about/contact" },
    ],
  },
  { id: "centers", label: "특화진료센터", to: "/centers" },
  { id: "checkup", label: "건강검진", to: "/checkup" },
  {
    id: "support",
    label: "고객센터",
    to: "/board/Notice",
    children: [
      { id: "support-notice", label: "공지사항", to: "/board/Notice" },
      { id: "support-info", label: "진료안내", to: "/about/info" },
      { id: "support-contact", label: "오시는 길", to: "/about/contact" },
    ],
  },
];

interface HeaderProps {
  menuItems?: SiteMenuConfigItem[];
}

export function Header({ menuItems = [] }: HeaderProps) {
  const isAdmin = useIsAdmin();
  const { user, permissions, roles } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 홈 다크 히어로 위 = 투명 / 그 외 = 흰 배경
  const isTransparent = isHome && !scrolled;

  const filterItems = (items: SiteMenuConfigItem[]): SiteMenuConfigItem[] =>
    items
      .filter((item) => {
        if (!item.permission || (Array.isArray(item.permission) && item.permission.length === 0)) return true;
        if (!user) return false;
        const required = Array.isArray(item.permission) ? item.permission : [item.permission];
        return checkUserPermissions(required, permissions, roles, false);
      })
      .map((item) => (item.children ? { ...item, children: filterItems(item.children) } : item));

  const visibleItems = useMemo(() => {
    const source = menuItems.length > 0 ? menuItems : MENU_ITEMS_FALLBACK;
    return filterItems(source);
  }, [menuItems, permissions, roles, user]);

  return (
    <header
      id="siteheader"
      className={
        "sticky top-0 z-50 w-full " +
        (isTransparent
          ? "bg-transparent border-b border-transparent"
          : "bg-white border-b border-[color:var(--color-ds-border)]")
      }
    >
      <div className="max-w-[1280px] mx-auto px-8 h-[78px] flex items-center justify-between gap-5">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/images/logo.png"
            alt="24시 다산 원동물의료센터"
            className={
              "h-10 w-auto block transition-[filter] " +
              (isTransparent ? "brightness-0 invert" : "")
            }
          />
        </Link>

        {/* Center nav */}
        <nav className="hidden lg:flex items-center gap-9">
          {/* 홈 아이콘 */}
          <Link
            to="/"
            aria-label="메인페이지"
            title="메인페이지"
            className={
              "transition-colors " +
              (isTransparent ? "text-white hover:text-[color:var(--color-ds-teal-3)]" : "text-[color:var(--color-ds-text)] hover:text-[color:var(--color-ds-teal)]")
            }
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V20h14V9.5" />
            </svg>
          </Link>
          {visibleItems.map((menu) => (
            <div key={menu.id} className="relative group">
              <Link
                to={menu.to || "#"}
                className={
                  "flex items-center text-[15px] font-bold transition-colors py-2 " +
                  (isTransparent ? "text-white hover:text-[color:var(--color-ds-teal-3)]" : "text-[color:var(--color-ds-text)] hover:text-[color:var(--color-ds-teal)]")
                }
              >
                {menu.label}
              </Link>
              {menu.children && menu.children.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-52 p-2 bg-white rounded-xl shadow-lg border border-[color:var(--color-ds-border)]">
                    {menu.children.map((sub) => (
                      <Link
                        key={sub.id}
                        to={sub.to || "#"}
                        className="block px-4 py-2 text-sm text-[color:var(--color-ds-text-sub)] rounded-md hover:bg-[color:var(--color-ds-bg)] hover:text-[color:var(--color-ds-teal)] transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* 24h 전화 CTA pill */}
          <a
            href="tel:0507-1330-5958"
            className={
              "hidden sm:flex items-center gap-2 px-5 py-[11px] rounded-full text-sm font-bold transition-colors " +
              (isTransparent
                ? "bg-white/10 border border-white/40 text-white hover:bg-white/20"
                : "bg-[color:var(--color-ds-dark-2)] text-white hover:bg-[color:var(--color-ds-dark)]")
            }
          >
            <span className="w-[7px] h-[7px] rounded-full bg-[color:var(--color-ds-teal-2)] animate-pulse-dot" />
            24시 0507-1330-5958
          </a>

          {/* auth links (compact) */}
          <div className={"hidden md:flex items-center gap-1 " + (isTransparent ? "text-white/85" : "text-[color:var(--color-ds-text-sub)]")}>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" title="관리자페이지" className="p-2 hover:opacity-80">
                    <Settings className="w-4 h-4" />
                  </Link>
                )}
                <Link to="/auth/mypage" title="마이페이지" className="p-2 hover:opacity-80">
                  <User className="w-4 h-4" />
                </Link>
                <Link to="/auth/logout" title="로그아웃" className="p-2 hover:opacity-80">
                  <LogOut className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <Link to="/auth/login" title="로그인" className="p-2 hover:opacity-80">
                <LogIn className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* mobile menu toggle */}
          <button
            className={"lg:hidden p-2 " + (isTransparent ? "text-white" : "text-[color:var(--color-ds-text)]")}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[color:var(--color-ds-border)] bg-white text-[color:var(--color-ds-text)]">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {visibleItems.map((menu) => (
              <div key={menu.id} className="space-y-1">
                <Link
                  to={menu.to || "#"}
                  className="block font-bold px-2 py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {menu.label}
                </Link>
                {menu.children && menu.children.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    {menu.children.map((sub) => (
                      <Link
                        key={sub.id}
                        to={sub.to || "#"}
                        className="text-sm text-[color:var(--color-ds-text-sub)] hover:text-[color:var(--color-ds-teal)] py-1"
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-[color:var(--color-ds-border)] flex flex-col gap-2">
              <a
                href="tel:0507-1330-5958"
                className="flex items-center justify-center gap-2 w-full py-2 text-sm font-bold text-white bg-[color:var(--color-ds-dark-2)] rounded-md"
              >
                24시 0507-1330-5958
              </a>
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-[color:var(--color-ds-text)] border border-[color:var(--color-ds-border)] rounded-md"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      관리자
                    </Link>
                  )}
                  <Link
                    to="/auth/mypage"
                    className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-[color:var(--color-ds-text)] border border-[color:var(--color-ds-border)] rounded-md"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    마이페이지
                  </Link>
                  <Link
                    to="/auth/logout"
                    className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-[color:var(--color-ds-text)] border border-[color:var(--color-ds-border)] rounded-md"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </Link>
                </>
              ) : (
                <Link
                  to="/auth/login"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-[color:var(--color-ds-text)] border border-[color:var(--color-ds-border)] rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
