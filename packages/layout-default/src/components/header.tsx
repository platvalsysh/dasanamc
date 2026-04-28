import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useAuth, checkUserPermissions, useIsAdmin } from "@repo/auth/ui";

import {
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogIn,
  LogOut,
} from "lucide-react";

import type { SiteMenuConfigItem } from "@repo/core/types";

// Default fallback
const MENU_ITEMS_FALLBACK: SiteMenuConfigItem[] = [
  {
    id: "about",
    label: "동창회소개",
    to: "/about/greeting",
    children: [
      { id: "greeting", label: "동창회장 인사말", to: "/about/greeting" },
      { id: "organization", label: "동창회 조직", to: "/about/organization" },
      { id: "bylaws", label: "동창회 정관", to: "/about/bylaws" },
      { id: "contact", label: "CONTACT US", to: "/about/contact" },
    ],
  },
];

interface HeaderProps {
  menuItems?: SiteMenuConfigItem[];
}

export function Header({ menuItems = [] }: HeaderProps) {
  const isAdmin = useIsAdmin();
  const { user, permissions, roles } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  const filterItems = (items: SiteMenuConfigItem[]): SiteMenuConfigItem[] => {
    return items.filter(item => {
      // Visibility check logic
      // If no permission set -> visible
      if (!item.permission || item.permission.length === 0) return true;

      // If permission is set, check if user has it
      if (!user) return false; // Not logged in -> hidden (or maybe we add visibility flag later)

      const required = Array.isArray(item.permission) ? item.permission : [item.permission];
      return checkUserPermissions(required, permissions, roles, false);
    }).map(item => {
      if (item.children) {
        return { ...item, children: filterItems(item.children) };
      }
      return item;
    }).filter(item => {
      // Optional: Hide parents with no children if they are just grouping folders?
      // Default: Show all that passed permission check.
      return true;
    });
  };

  const visibleItems = useMemo(() => {
    const source = menuItems.length > 0 ? menuItems : MENU_ITEMS_FALLBACK;
    return filterItems(source);
  }, [menuItems, permissions, roles, user]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[var(--color-snublue)]">
        {/* Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[var(--color-snublue)] via-[var(--color-snublue)] to-[var(--color-snugold)]" />

        <div className="w-full px-4 md:px-8 h-20 flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] items-center">
          {/* Logo */}
          <div className="flex justify-start">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-2xl text-white"
            >
              <img src="/images/logo.png" alt="서울대학교 화학생물공학부 동창회" className="h-12 w-auto block" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 justify-center">
            {visibleItems.map((menu) => (
              <div
                key={menu.id}
                className="relative group"
                onMouseEnter={() => setActiveSubmenu(menu.label)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <Link
                  to={menu.to || "#"}
                  target={menu.target || "_self"}
                  className="flex items-center gap-1 py-2 text-lg font-bold text-gray-200 hover:text-white transition-colors"
                >
                  {menu.label}
                  {menu.children && menu.children.length > 0 && (
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-gray-300 group-hover:text-white" />
                  )}
                </Link>

                {/* Dropdown */}
                {menu.children && menu.children.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                    <div className="w-48 p-2 bg-white rounded-lg shadow-lg border border-gray-100">
                      {menu.children.map((subItem) => (
                        <Link
                          key={subItem.id}
                          to={subItem.to || "#"}
                          target={subItem.target || "_self"}
                          className="block px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center justify-end gap-4">
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      관리자페이지
                    </Link>
                  )}
                  <Link
                    to="/auth/mypage"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    마이페이지
                  </Link>
                  <Link
                    to="/auth/logout"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    로그인
                  </Link>
                  <Link
                    to="/auth/sign-up"
                    className="px-4 py-2 text-sm font-medium text-primary bg-white rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white hover:text-gray-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {visibleItems.map((menu) => (
                <div key={menu.id} className="space-y-2">
                  <div className="font-medium text-gray-900 px-2">
                    {menu.label}
                  </div>
                  {menu.children && (
                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {menu.children.map((subItem) => (
                        <Link
                          key={subItem.id}
                          to={subItem.to || "#"}
                          target={subItem.target || "_self"}
                          className="text-sm text-gray-600 hover:text-primary py-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        관리자페이지
                      </Link>
                    )}
                    <Link
                      to="#"
                      className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      마이페이지
                    </Link>
                    <Link
                      to="/auth/logout"
                      className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      로그인
                    </Link>
                    <Link
                      to="/auth/sign-up"
                      className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
