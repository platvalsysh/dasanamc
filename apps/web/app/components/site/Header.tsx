import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useAuth, checkUserPermissions, useIsAdmin } from "@repo/auth/ui";
import { Menu, X, Settings, User, LogOut } from "lucide-react";
import type { SiteMenuConfigItem } from "@repo/core/types";
import { ABOUT_MENU, CENTER_MENU, SUPPORT_MENU } from "~/data/dasanone-content";

/**
 * 다산원동물의료센터 헤더 — dual-theme + per-item dropdown.
 *
 * - 다크 hero 위: `data-theme="dark"` (투명 + 흰 메뉴)
 * - 스크롤 다운 후: `data-theme="light"` (흰 배경 + 진한 글자)
 * - 각 메뉴 항목 hover → 해당 항목의 children dropdown 만 작은 카드로 표시
 */

const MENU_ITEMS_FALLBACK: SiteMenuConfigItem[] = [
  {
    id: "about",
    label: "병원소개",
    to: "/about",
    children: ABOUT_MENU.map((m, i) => ({ id: `about-${i}`, label: m.label, to: m.to })),
  },
  {
    id: "centers",
    label: "특화진료센터",
    to: "/centers",
    children: CENTER_MENU.map((m, i) => ({ id: `c-${i}`, label: m.label, to: m.to })),
  },
  {
    id: "emergency",
    label: "24시 응급",
    to: "/emergency",
  },
  {
    id: "cases",
    label: "치료사례",
    to: "/cases",
  },
  {
    id: "support",
    label: "고객센터",
    to: "/support",
    children: SUPPORT_MENU.map((m, i) => ({ id: `sup-${i}`, label: m.label, to: m.to })),
  },
];

interface HeaderProps {
  menuItems?: SiteMenuConfigItem[];
}

export function Header({ menuItems = [] }: HeaderProps) {
  const isAdmin = useIsAdmin();
  const { user, permissions, roles } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const filterItems = (items: SiteMenuConfigItem[]): SiteMenuConfigItem[] =>
    items
      .filter((item) => {
        if (!item.permission || (Array.isArray(item.permission) && item.permission.length === 0))
          return true;
        if (!user) return false;
        const required = Array.isArray(item.permission) ? item.permission : [item.permission];
        return checkUserPermissions(required, permissions, roles, false);
      })
      .map((item) => (item.children ? { ...item, children: filterItems(item.children) } : item));

  const visibleItems = useMemo(() => {
    const source = menuItems.length > 0 ? menuItems : MENU_ITEMS_FALLBACK;
    return filterItems(source);
  }, [menuItems, permissions, roles, user]);

  const isPathActive = (to?: string) => {
    if (!to) return false;
    const path = to.split("#")[0];
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <header
      id="siteheader"
      data-theme="dark"
      className="fixed top-0 left-0 right-0 z-50 w-full"
    >
      <div
        className="mx-auto h-[78px] grid items-center gap-5 grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]"
        style={{
          maxWidth: "none",
          padding: "0 clamp(24px, 4vw, 64px)",
        }}
      >
        {/* Logo — 원본 비율(1000:215) 유지: 칸 폭에 눌리지 않게 max-w-none */}
        <Link to="/" className="col-start-1 justify-self-start flex items-center">
          <img
            src="/images/logo-horizontal.png"
            alt="24시 다산 원동물의료센터"
            className="logo-light h-8 lg:h-10 w-auto max-w-none block"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <img
            src="/images/logo-horizontal.png"
            alt="24시 다산 원동물의료센터"
            className="logo-dark h-8 lg:h-10 w-auto max-w-none block"
            style={{ display: "none" }}
          />
        </Link>

        {/* Center nav */}
        <nav className="hidden lg:flex items-center gap-8 topnav lg:col-start-2">
          <Link
            to="/"
            aria-label="메인페이지"
            title="메인페이지"
            data-active={location.pathname === "/" ? "1" : ""}
            className="flex items-center transition-colors"
            style={{ height: 78, padding: "0 2px" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V20h14V9.5" />
            </svg>
          </Link>
          {visibleItems.map((menu) => {
            const hasChildren = menu.children && menu.children.length > 0;
            const wide = hasChildren && menu.children!.length > 6;
            return (
              <div key={menu.id} className="navitem">
                <Link
                  to={menu.to || "#"}
                  data-active={isPathActive(menu.to) ? "1" : ""}
                  className="flex items-center transition-colors"
                  style={{ padding: "0 2px", fontSize: "15.5px", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}
                >
                  {menu.label}
                </Link>
                {hasChildren && (
                  <div className={"dropdown" + (wide ? " wide" : "")}>
                    {menu.children!.map((sub) => {
                      const centerEntry = CENTER_MENU.find((c) => c.to === sub.to);
                      return (
                        <Link key={sub.id} to={sub.to || "#"}>
                          {menu.id === "centers" && centerEntry && (
                            <span className="ddnum">{centerEntry.num}</span>
                          )}
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side — nav 가 display:none 인 모바일에서도 3번째 칸 고정 */}
        <div className="col-start-3 justify-self-end flex items-center gap-3">
          <a
            href="tel:0507-1330-5958"
            className="cta-call hidden sm:flex items-center gap-2 px-5 py-[11px] rounded-full text-sm font-bold transition-colors"
            style={{ background: "var(--color-ds-dark-warm)", color: "#fff" }}
          >
            <span className="w-[7px] h-[7px] rounded-full bg-[color:var(--color-ds-teal-2)] animate-pulse-dot" />
            24시 0507-1330-5958
          </a>

          {/* auth links (compact) */}
          <div className="hidden md:flex items-center gap-1 text-[color:var(--color-ds-text-sub)]">
            {user && (
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
            )}
          </div>

          <button
            className="lg:hidden p-2 text-[color:var(--color-ds-text)]"
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
                className="flex items-center justify-center gap-2 w-full py-2 text-sm font-bold text-white bg-[color:var(--color-ds-dark-warm)] rounded-md"
              >
                24시 0507-1330-5958
              </a>
              {user && (
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
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
