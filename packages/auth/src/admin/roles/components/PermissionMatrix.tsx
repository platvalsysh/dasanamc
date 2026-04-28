import { useState, useRef, useEffect } from "react";

import {
  Shield,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Lock,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  Eye,
  TrendingUp,
} from "lucide-react";
import { Checkbox } from "@repo/ui-admin";
import { PermissionDeleteDialog } from "./PermissionDeleteDialog";

interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  is_dangerous: boolean;
  is_system: boolean;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  level: number;
  is_active: boolean;
  userCount: number;
  permissions: string[];
  is_system: boolean;
}

interface PermissionMatrixProps {
  selectedRole: Role;
  permissions: Permission[];
  hasUnsavedChanges: boolean;
  onTogglePermission: (roleId: string, permissionName: string) => void;
  onSave: () => void;
  onReset: () => void;
  loading: boolean;
  actionData?: { success: boolean; message: string } | null;
}

const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    dashboard: <BarChart3 className="w-4 h-4" />,
    users: <Users className="w-4 h-4" />,
    products: <Package className="w-4 h-4" />,
    orders: <ShoppingCart className="w-4 h-4" />,
    analytics: <TrendingUp className="w-4 h-4" />,
    reports: <AlertTriangle className="w-4 h-4" />,
    settings: <Settings className="w-4 h-4" />,
    admins: <Shield className="w-4 h-4" />,
    audit: <FileText className="w-4 h-4" />,
  };
  return iconMap[category] || <Eye className="w-4 h-4" />;
};

export function PermissionMatrix({
  selectedRole,
  permissions,
  hasUnsavedChanges,
  onTogglePermission,
  onSave,
  onReset,
  loading,
  actionData,
}: PermissionMatrixProps) {
  const [permissionFilter, setPermissionFilter] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const categoryFilterRef = useRef<HTMLDivElement>(null);

  // Close category filter when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryFilterRef.current &&
        !categoryFilterRef.current.contains(event.target as Node)
      ) {
        setIsCategoryFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const uniqueCategories = Array.from(
    new Set(permissions.map((p) => p.category)),
  );

  const filteredPermissions = permissions.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
      p.display_name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(permissionFilter.toLowerCase());

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-gray-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedRole.display_name}
              {selectedRole.is_system && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  System
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600">{selectedRole.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {actionData?.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">{actionData.message}</p>
          </div>
        )}
        {actionData?.success === false && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700">{actionData.message}</p>
          </div>
        )}

        {hasUnsavedChanges && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <p className="text-sm text-orange-700">
              저장되지 않은 변경사항이 있습니다. 하단의 "변경사항 저장" 버튼을
              클릭하세요.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">
            권한 설정
          </h3>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="권한 검색..."
                value={permissionFilter}
                onChange={(e) => setPermissionFilter(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

             {/* Multi-select Category Filter */}
             <div className="relative" ref={categoryFilterRef}>
                <button
                onClick={() =>
                    setIsCategoryFilterOpen(!isCategoryFilterOpen)
                }
                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                    selectedCategories.length > 0
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                >
                <Filter className="w-4 h-4" />
                <span>카테고리</span>
                {selectedCategories.length > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {selectedCategories.length}
                    </span>
                )}
                <ChevronDown className="w-3 h-3 ml-1" />
                </button>

                {isCategoryFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 max-h-64 overflow-y-auto">
                    <div className="mb-2 px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    카테고리 선택
                    </div>
                    <div className="space-y-1">
                    {uniqueCategories.map((category) => (
                        <label
                        key={category}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                        >
                        <Checkbox
                            checked={selectedCategories.includes(
                            category,
                            )}
                            onCheckedChange={() =>
                            toggleCategory(category)
                            }
                        />
                        <span className="text-sm text-gray-700">
                            {category}
                        </span>
                        </label>
                    ))}
                    </div>
                    {selectedCategories.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                        onClick={() => setSelectedCategories([])}
                        className="w-full px-2 py-1.5 text-xs text-center text-red-600 hover:bg-red-50 rounded"
                        >
                        필터 초기화
                        </button>
                    </div>
                    )}
                </div>
                )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredPermissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredPermissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    {getCategoryIcon(permission.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {permission.display_name}
                      </p>
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                        {permission.name}
                      </span>
                      <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {permission.category}
                      </span>
                      {permission.is_system && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {permission.description}
                    </p>
                    {permission.is_dangerous && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 mt-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        위험한 권한
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label
                    className={`relative inline-flex items-center cursor-pointer ${selectedRole.is_system ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      disabled={selectedRole.is_system}
                      checked={selectedRole.permissions.includes(
                        permission.name,
                      )}
                      onChange={() =>
                        onTogglePermission(selectedRole.id, permission.name)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>

                  {!permission.is_system && (
                      <PermissionDeleteDialog permission={permission} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-2">
            <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                권한 변경 시 주의사항
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                권한을 변경하면 해당 역할을 가진 모든 사용자에게 즉시
                적용됩니다. 중요한 권한 변경 시 신중하게 검토해 주세요.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onSave}
            disabled={!hasUnsavedChanges || loading || selectedRole.is_system}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
              hasUnsavedChanges && !loading && !selectedRole.is_system
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "저장 중..." : "변경사항 저장"}
          </button>
          <button
            onClick={onReset}
            disabled={!hasUnsavedChanges || loading}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              hasUnsavedChanges && !loading
                ? "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                : "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
            }`}
          >
            변경사항 취소
          </button>
        </div>
      </div>
    </div>
  );
}
