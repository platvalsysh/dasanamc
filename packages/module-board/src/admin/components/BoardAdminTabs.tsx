import React from "react";
import { Link } from "react-router";

interface BoardAdminTabsProps {
  moduleId: string;
  activeTab: "general" | "category" | "templates";
}

export function BoardAdminTabs({ moduleId, activeTab }: BoardAdminTabsProps) {
  const tabs = [
    { id: "general", label: "기본 설정", to: `/admin/board/${moduleId}` },
    { id: "category", label: "카테고리 관리", to: `/admin/board/${moduleId}/category` },
    { id: "templates", label: "템플릿 관리", to: `/admin/board/${moduleId}/templates` },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            to={tab.to}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
