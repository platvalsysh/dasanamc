import React from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  User,
  Store,
  MessageSquare,
  Menu,
  Shield,
  Database,
  Server,
  Mail,
  Bell,
  Lock,
} from "lucide-react";

export const ICON_MAP = {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  User,
  Store,
  MessageSquare,
  Menu,
  Shield,
  Database,
  Server,
  Mail,
  Bell,
  Lock,
} as const;

export type IconKey = keyof typeof ICON_MAP;

/**
 * Get a list of available icon names
 */
export function getIcons(): IconKey[] {
  return Object.keys(ICON_MAP) as IconKey[];
}

/**
 * Get a React Node for a specific icon name
 * @param iconName The name of the icon (key in ICON_MAP)
 * @param className Optional className to apply to the icon
 * @returns ReactNode for the icon, or Package icon if not found
 */
export function getIcon(iconName: IconKey, className?: string): React.ReactNode;
export function getIcon(iconName: string, className?: string): React.ReactNode;
export function getIcon(
  iconName: string,
  className: string = "w-4 h-4",
): React.ReactNode {
  const IconComponent = ICON_MAP[iconName as IconKey] || Package;
  return <IconComponent className={className} />;
}
