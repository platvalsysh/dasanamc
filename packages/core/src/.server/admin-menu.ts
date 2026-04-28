import { configManager } from "./ConfigManager";
import type { AdminMenuConfigItem } from "../types";

// Default configuration derived from static constants, but with icon names
export const DEFAULT_MENU_CONFIG: AdminMenuConfigItem[] = [
  {
    id: "dashboard",
    label: "대시보드",
    icon: "LayoutDashboard",
    path: "/admin",
    permission: "dashboard.view",
  },
  {
    id: "users",
    label: "사용자 관리",
    icon: "Users",
    permission: "users.view",
    children: [
      {
        id: "users-list",
        label: "사용자 목록",
        icon: "Users",
        path: "/admin/users",
        permission: "users.view",
      },
      {
        id: "users-roles",
        label: "권한 관리",
        icon: "Settings",
        path: "/admin/users/roles",
        permission: "admins.view",
      },
      {
        id: "users-assign-roles",
        label: "역할 부여",
        icon: "User",
        path: "/admin/users/assign-roles",
        permission: ["admins.create", "admins.edit"],
      },
    ],
  },
  {
    id: "stores",
    label: "상점 관리",
    icon: "Store",
    permission: "users.view",
    children: [
      {
        id: "stores-list",
        label: "상점 목록",
        icon: "Store",
        path: "/admin/stores",
        permission: "users.view",
      },
      {
        id: "display-categories",
        label: "진열 카테고리",
        icon: "FileText",
        path: "/admin/stores/categories",
        permission: "products.edit",
      },
      {
        id: "product-display",
        label: "상품 진열 관리",
        icon: "Package",
        path: "/admin/stores/product-display",
        permission: "products.edit",
      },
    ],
  },
  {
    id: "boards",
    label: "게시판 관리",
    icon: "MessageSquare",
    path: "/admin/board",
    permission: "settings.system",
  },
  {
    id: "products",
    label: "상품 관리",
    icon: "Package",
    permission: "products.view",
    children: [
      {
        id: "products-list",
        label: "상품 목록",
        icon: "Package",
        path: "/admin/products",
        permission: "products.view",
      },
      {
        id: "products-categories",
        label: "카테고리",
        icon: "FileText",
        path: "/admin/products/categories",
        permission: "products.categories",
      },
    ],
  },
  {
    id: "orders",
    label: "주문 관리",
    icon: "ShoppingCart",
    path: "/admin/orders",
    permission: "orders.view",
  },
  // Note: Settings menu is now hardcoded in the layout header, so optional here.
];

/**
 * Get the current admin menu configuration
 */
export async function getAdminMenu(): Promise<AdminMenuConfigItem[]> {
  return configManager.get<AdminMenuConfigItem[]>(
    "site",
    "adminMenu",
    DEFAULT_MENU_CONFIG,
  );
}

/**
 * Set the admin menu configuration
 */
export async function setAdminMenu(menu: AdminMenuConfigItem[]): Promise<void> {
  await configManager.set(
    "site",
    "adminMenu",
    menu,
    "Admin menu configuration",
  );
}
