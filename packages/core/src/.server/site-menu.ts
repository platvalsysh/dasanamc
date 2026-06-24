import { configManager } from "./ConfigManager";
import type { SiteMenuConfigItem } from "../types";

export interface SiteMenuConfig {
  [menuId: string]: SiteMenuConfigItem[];
}

const MENU_CONFIG_KEY_PREFIX = "siteMenu_";

/**
 * 외주별 메뉴 기본값은 packages/core 가 아니라 각 외주 앱(`apps/web/app/...`)
 * 의 헤더 컴포넌트가 자체 fallback 으로 들고 있어야 한다. core 는 빈 배열만
 * 반환 — DB 에 저장된 메뉴(`core.configs.siteMenu_*`) 가 source of truth.
 *
 * 이전엔 동창회/다산원 메뉴 IA 가 여기 박혀 있어 외주마다 코드를 수정해야
 * 했음 (audit H4 안티패턴).
 */
export const DEFAULT_HEADER_MENU: SiteMenuConfigItem[] = [];

const DEFAULT_SITE_MENU_CONFIG: SiteMenuConfig = {};

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
