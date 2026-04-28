import { Link, Outlet, useLocation } from "react-router";
import {
  Settings,
  Bell,
  Mail,
  Shield,
  Database,
  Palette,
  Code,
  Server,
  ChevronRight,
  Menu,
  Box,
  Package,
} from "lucide-react";
import { useState } from "react";

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const settingSections: SettingSection[] = [
  {
    id: "general",
    title: "일반 설정",
    description: "사이트 기본 정보 및 설정",
    icon: <Settings className="w-5 h-5" />,
    path: "/admin/system/settings",
  },
  {
    id: "menu",
    title: "메뉴 설정",
    description: "관리자 메뉴 구성",
    icon: <Menu className="w-5 h-5" />,
    path: "/admin/system/settings/menu",
  },
  {
    id: "appearance",
    title: "외관",
    description: "테마, 로고, 색상 설정",
    icon: <Palette className="w-5 h-5" />,
    path: "/admin/system/settings/appearance",
  },
  {
    id: "email",
    title: "이메일",
    description: "이메일 템플릿 및 발송 설정",
    icon: <Mail className="w-5 h-5" />,
    path: "/admin/system/settings/email",
  },
  {
    id: "notifications",
    title: "알림",
    description: "시스템 알림 설정",
    icon: <Bell className="w-5 h-5" />,
    path: "/admin/system/settings/notifications",
  },
  {
    id: "security",
    title: "보안",
    description: "보안 정책 및 접근 제어",
    icon: <Shield className="w-5 h-5" />,
    path: "/admin/system/settings/security",
  },
  {
    id: "database",
    title: "데이터베이스",
    description: "백업 및 유지보수",
    icon: <Database className="w-5 h-5" />,
    path: "/admin/system/settings/database",
  },
  {
    id: "modules-installed",
    title: "설치된 모듈",
    description: "서버에 등록된 모듈 목록",
    icon: <Box className="w-5 h-5" />,
    path: "/admin/system/settings/installed-modules",
  },
  {
    id: "modules-db",
    title: "모듈 관리",
    description: "DB에 저장된 모듈 관리",
    icon: <Package className="w-5 h-5" />,
    path: "/admin/system/settings/modules",
  },
  {
    id: "api",
    title: "API",
    description: "API 키 및 연동 설정",
    icon: <Code className="w-5 h-5" />,
    path: "/admin/system/settings/api",
  },
  {
    id: "server",
    title: "서버",
    description: "서버 설정 및 성능",
    icon: <Server className="w-5 h-5" />,
    path: "/admin/system/settings/server",
  },
];

export default function SettingsLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-600 mt-1">시스템 설정을 관리합니다</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        {/* Settings Navigation */}
        <div
          className={`
            lg:col-span-1 lg:block 
            ${isMobileMenuOpen ? "block absolute z-10 w-full top-0 left-0 bg-white shadow-lg lg:static lg:shadow-none lg:w-auto" : "hidden"}
          `}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                설정 카테고리
              </h2>
              {isMobileMenuOpen && (
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden text-sm text-gray-500 hover:text-gray-700"
                >
                  닫기
                </button>
              )}
            </div>
            <nav className="p-2 max-h-[60vh] overflow-y-auto lg:max-h-none">
              {settingSections.map((section) => (
                <Link
                  key={section.id}
                  to={section.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === section.path ||
                    (section.path !== "/admin/system/settings" &&
                      location.pathname.startsWith(section.path))
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {section.icon}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{section.title}</p>
                    <p className="text-xs text-gray-500">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
