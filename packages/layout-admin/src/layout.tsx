import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router";
import {
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
} from "lucide-react";

import { useUser, useUserOrFail, PermissionGate } from "@repo/auth/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui-admin";
import type { AdminMenuConfigItem } from "@repo/core/types";
import { getIcon } from "@repo/core/ui";
import { HorizontalScroll } from "./ui/HorizontalScroll";

import "@repo/ui-admin/admin.css";


type MenuStatus = "active" | "child-active" | "inactive";

/**
 * Calculates the active status of a menu item based on the current pathname.
 * - 'active': The item's path exactly matches the current pathname.
 * - 'child-active': One of the item's children (recursive) is 'active' or 'child-active'.
 * - 'inactive': Neither of the above.
 */
function getMenuStatus(
  item: AdminMenuConfigItem,
  pathname: string,
): MenuStatus {
  const normalize = (path: string) => path.replace(/\/+$/, "");
  const normalizedPath = normalize(item.path || "");
  const normalizedPathname = normalize(pathname);

  // 1. Exact match
  if (normalizedPath === normalizedPathname) {
    return "active";
  }

  // 2. Recursive check for children
  if (item.children && item.children.length > 0) {
    const hasActiveChild = item.children.some(
      (child) => getMenuStatus(child, pathname) !== "inactive",
    );
    if (hasActiveChild) {
      return "child-active";
    }
  }

  return "inactive";
}

interface AdminLayoutContentProps {
  menuItems?: AdminMenuConfigItem[];
}

function AdminLayoutContent({ menuItems = [] }: AdminLayoutContentProps) {
  const user = useUserOrFail();

  // --- State Management ---
  // --- [Mobile] State ---
  // Controls the visibility of the mobile overlay menu. Default is false (closed).
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- [Desktop] State ---
  // Controls whether the sidebar is expanded (w-64) or collapsed (Activity Bar, w-16). Default is true (expanded).
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const location = useLocation();

  // --- Effects ---

  // --- [Mobile] Effect ---
  // Close mobile menu and reset open submenu on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
      setOpenMenuId(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // --- Handlers ---
  // --- [Mobile] Handler ---
  const toggleMobileMenu = () => setIsMobileOpen((prev) => !prev);

  // --- [Desktop] Handler ---
  const toggleDesktopSidebar = () => setIsDesktopExpanded((prev) => !prev);

  // Identify active items to determine if sidebar should be shown at all
  const activeTopItem = menuItems.find(
    (item) => getMenuStatus(item, location.pathname) !== "inactive",
  );
  const sideMenuItems = activeTopItem?.children || [];

  // Desktop sidebar visibility: Shown only if there are active sub-items.
  // Note: This variable controls *presence*, while isDesktopExpanded controls *width*.
  const showDesktopSidebar = sideMenuItems.length > 0;

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground relative">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* [Mobile] Menu Toggle Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              {isMobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 min-w-8 min-h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">
                Admin Panel
              </span>
            </Link>

            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors ml-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">홈페이지</span>
            </Link>

            {/* Top Menu Items */}
            <nav className="hidden lg:block flex-1 mx-4 min-w-0">
              <HorizontalScroll>
                {menuItems.map((item) => {
                  const status = getMenuStatus(item, location.pathname);
                  const isOpen = openMenuId === item.id;

                  // Styling logic based on status
                  let buttonClass = "hover:bg-gray-100 text-gray-700";
                  if (status === "active") {
                    buttonClass = "bg-blue-100 text-blue-700 font-semibold"; // Strong highlight
                  } else if (status === "child-active") {
                    buttonClass = "bg-blue-50 text-blue-600 font-medium"; // Subtle highlight
                  } else if (isOpen) {
                    buttonClass = "bg-gray-100 text-gray-700"; // Maintain hover state
                  }

                  return (
                    <PermissionGate
                      key={item.id}
                      permission={item.permission || []}
                    >
                      {item.children && item.children.length > 0 ? (
                        <Popover
                          open={isOpen}
                          onOpenChange={(open) =>
                            setOpenMenuId(open ? item.id : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <button
                              data-active={status === "active"}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shrink-0 outline-none select-none ${buttonClass}`}
                            >
                              {getIcon(item.icon)}
                              <span className="text-sm">{item.label}</span>
                              <ChevronDown
                                className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-1" align="start">
                            <div className="flex flex-col">
                              {item.children.map((child) => {
                                const childStatus = getMenuStatus(
                                  child,
                                  location.pathname,
                                );
                                let childClass =
                                  "text-gray-700 hover:bg-gray-50";
                                if (childStatus === "active") {
                                  childClass =
                                    "bg-blue-100 text-blue-700 font-medium";
                                } else if (childStatus === "child-active") {
                                  childClass = "bg-blue-50 text-blue-600";
                                }

                                return (
                                  <PermissionGate
                                    key={child.id}
                                    permission={child.permission || []}
                                  >
                                    {child.path ? (
                                      <Link
                                        to={child.path}
                                        onClick={() => setOpenMenuId(null)}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${childClass}`}
                                      >
                                        {getIcon(child.icon)}
                                        <span>{child.label}</span>
                                      </Link>
                                    ) : (
                                      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
                                        {getIcon(child.icon)}
                                        <span>{child.label}</span>
                                      </div>
                                    )}
                                  </PermissionGate>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : item.path ? (
                        <Link
                          to={item.path}
                          data-active={status === "active"}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shrink-0 select-none ${buttonClass}`}
                        >
                          {getIcon(item.icon)}
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 shrink-0 select-none">
                          {getIcon(item.icon)}
                          <span className="text-sm">{item.label}</span>
                        </div>
                      )}
                    </PermissionGate>
                  );
                })}
              </HorizontalScroll>
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <Link
              to="/admin/system/settings"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="설정"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>

            <div className="flex items-center gap-2 ml-2">
              <button
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={user.display_name}
              >
                <div className="w-8 h-8 min-w-8 min-h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium hidden sm:block text-ellipsis overflow-hidden whitespace-nowrap max-w-25">
                  {user.display_name}
                </span>
              </button>
            </div>

            <a
              href="/auth/logout"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </a>
          </div>
        </div>
      </header>

      {/* --- [Mobile] Sidebar --- */}
      {isMobileOpen && (
        <aside
          className={`lg:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 bg-white shadow-sm border-r border-gray-200 transition-transform duration-300 w-64 overflow-y-auto translate-x-0`}
        >
          <div className="flex flex-col h-full p-4 pb-24">
            <nav className="space-y-4">
              {menuItems.map((item) => (
                <div key={item.id} className="space-y-1">
                  {/* Parent Item */}
                  <PermissionGate permission={item.permission || []}>
                    <div className="px-3 py-2">
                      {item.children && item.children.length > 0 ? (
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {getIcon(item.icon)}
                          <span>{item.label}</span>
                        </div>
                      ) : item.path ? (
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center gap-2 font-semibold text-gray-900 ${getMenuStatus(item, location.pathname) === "active" ? "text-blue-600" : ""}`}
                        >
                          {getIcon(item.icon)}
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 font-semibold text-gray-500">
                          {getIcon(item.icon)}
                          <span>{item.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Children Items */}
                    {item.children && item.children.length > 0 && (
                      <div className="pl-4 space-y-1">
                        {item.children.map((child) => {
                          const status = getMenuStatus(
                            child,
                            location.pathname,
                          );
                          const isActive = status === "active";

                          return (
                            <PermissionGate
                              key={child.id}
                              permission={child.permission || []}
                            >
                              {child.path ? (
                                <Link
                                  to={child.path}
                                  onClick={() => setIsMobileOpen(false)}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                  {getIcon(child.icon)}
                                  <span>{child.label}</span>
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
                                  {getIcon(child.icon)}
                                  <span>{child.label}</span>
                                </div>
                              )}
                            </PermissionGate>
                          );
                        })}
                      </div>
                    )}
                  </PermissionGate>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* --- [Desktop] Sidebar --- */}
      {showDesktopSidebar && (
        <aside
          className={`hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-20 bg-white shadow-sm border-r border-gray-200 transition-all duration-300 overflow-y-auto
            ${isDesktopExpanded ? "w-64" : "w-16"}
          `}
        >
          <div
            className={`flex flex-col h-full ${isDesktopExpanded ? "p-4" : "p-2"} pb-24`}
          >
            {/* Toggle Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleDesktopSidebar}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                title={
                  isDesktopExpanded ? "Collapse Activity Bar" : "Expand Sidebar"
                }
              >
                {isDesktopExpanded ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Contextual Menu Content */}
            {activeTopItem && (
              <>
                {/* Title */}
                {isDesktopExpanded && (
                  <h2 className={`font-bold text-gray-900 mb-4 px-2`}>
                    {activeTopItem.label}
                  </h2>
                )}

                <nav className="space-y-1">
                  {sideMenuItems.map((item) => (
                    <PermissionGate
                      key={item.id}
                      permission={item.permission || []}
                    >
                      {item.path ? (
                        <Link
                          to={item.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group relative
                            ${
                              getMenuStatus(item, location.pathname) === "active"
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                            }
                            ${!isDesktopExpanded ? "justify-center" : ""}
                          `}
                          title={item.label}
                        >
                          {getIcon(item.icon)}
                          {isDesktopExpanded && (
                            <span className="text-sm transition-opacity duration-200">
                              {item.label}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div
                          className={`flex items-center gap-2 px-3 py-2 text-gray-500 ${!isDesktopExpanded ? "justify-center" : ""}`}
                          title={item.label}
                        >
                          {getIcon(item.icon)}
                          {isDesktopExpanded && (
                            <span className="text-sm">{item.label}</span>
                          )}
                        </div>
                      )}
                    </PermissionGate>
                  ))}
                </nav>
              </>
            )}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${showDesktopSidebar ? (isDesktopExpanded ? "lg:ml-64" : "lg:ml-16") : ""}`}
      >
        <div className="p-6 md:p-12">
          <Outlet />
        </div>
      </main>

      {/* [Mobile] Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 backdrop-blur-xs z-10 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  );
}

// 1. Define props for the main AdminLayout
export interface AdminLayoutProps {
  menuItems?: AdminMenuConfigItem[];
}

export default function AdminLayout({ menuItems }: AdminLayoutProps) {
  return (
    <PermissionGate
      permission="core.dashboard.view"
      fallback={<AdminAccessDenied />}
    >
      <AdminLayoutContent menuItems={menuItems} />
    </PermissionGate>
  );
}

function AdminAccessDenied() {
  const user = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const shouldRedirectToLogin = !user;

  useEffect(() => {
    if (shouldRedirectToLogin) {
      const redirectTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth/login?redirectTo=${redirectTo}`, { replace: true });
    }
  }, [shouldRedirectToLogin, navigate, location]);

  if (shouldRedirectToLogin) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          접근 권한이 없습니다
        </h1>
        <p className="text-gray-600 mb-6">
          관리자 패널에 접근하려면 관리자 권한이 필요합니다.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>

          <Link
            to="/auth/logout"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            다른 계정으로 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
