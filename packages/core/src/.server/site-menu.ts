import { configManager } from "./ConfigManager";
import type { SiteMenuConfigItem } from "../types";

export interface SiteMenuConfig {
  [menuId: string]: SiteMenuConfigItem[];
}

const MENU_CONFIG_KEY_PREFIX = "siteMenu_";

export const DEFAULT_HEADER_MENU: SiteMenuConfigItem[] = [
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
  {
    id: "centers",
    label: "특화진료센터",
    to: "/centers",
  },
  {
    id: "checkup",
    label: "건강검진",
    to: "/checkup",
  },
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

const DEFAULT_SITE_MENU_CONFIG: SiteMenuConfig = {
  header: DEFAULT_HEADER_MENU,
};

// Helper to get key
const getKey = (menuId: string) => `${MENU_CONFIG_KEY_PREFIX}${menuId}`;

/**
 * Get all site menus
 */
export async function getSiteMenus(): Promise<SiteMenuConfig> {
  // Determine active menu IDs
  // For now, we rely on "knownMenuIds" stored in config or default to basics.
  const knownMenus = await configManager.get<string[]>("site", "knownMenuIds", ["header", "footer"]);

  const result: SiteMenuConfig = {};
  for (const id of knownMenus) {
    result[id] = await getSiteMenu(id);
  }
  return result;
}

/**
 * Get a specific site menu
 */
export async function getSiteMenu(menuId: string = "header"): Promise<SiteMenuConfigItem[]> {
  const defaultMenu = DEFAULT_SITE_MENU_CONFIG[menuId] || [];
  return configManager.get<SiteMenuConfigItem[]>(
    "site",
    getKey(menuId),
    defaultMenu,
  );
}

/**
 * Set a specific site menu
 */
export async function setSiteMenu(menuId: string, items: SiteMenuConfigItem[]): Promise<void> {
  await configManager.set(
    "site",
    getKey(menuId),
    items,
    `Site menu configuration for ${menuId}`,
  );

  // Update known list if new
  const knownMenus = await configManager.get<string[]>("site", "knownMenuIds", ["header", "footer"]);
  if (!knownMenus.includes(menuId)) {
    await configManager.set("site", "knownMenuIds", [...knownMenus, menuId]);
  }
}

/**
 * Replace all site menus
 */
export async function setAllSiteMenus(menus: SiteMenuConfig): Promise<void> {
  for (const [id, items] of Object.entries(menus)) {
    await setSiteMenu(id, items);
  }
}
