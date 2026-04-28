import React from "react";
import { Link, Outlet, useLocation } from "react-router";
import { LucideLayoutDashboard, LucideChevronRight } from "lucide-react";

export default function BoardAdminLayout() {
  const location = useLocation();
  const isRoot = location.pathname === "/admin/board";

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link 
            to="/admin/board" 
            className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${isRoot ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}
          >
            <LucideLayoutDashboard size={14} />
            게시판 관리
          </Link>
          
          {!isRoot && (
            <>
              <LucideChevronRight size={14} className="text-gray-400" />
              <span className="text-gray-900 font-medium">
                {getSubPageTitle(location.pathname)}
              </span>
            </>
          )}
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function getSubPageTitle(path: string) {
  if (path.endsWith("/new")) return "게시판 생성";
  if (path.includes("/category")) return "카테고리 관리";
  if (path.includes("/templates")) return "템플릿 관리";
  // Fallback for edit page which is usually /admin/board/:id
  return "게시판 수정";
}
