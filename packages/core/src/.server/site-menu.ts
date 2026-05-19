import { configManager } from "./ConfigManager";
import type { SiteMenuConfigItem } from "../types";

export interface SiteMenuConfig {
  [menuId: string]: SiteMenuConfigItem[];
}

const MENU_CONFIG_KEY_PREFIX = "siteMenu_";

export const DEFAULT_HEADER_MENU: SiteMenuConfigItem[] = [
  {
    id: "about",
    label: "동창회소개",
    to: "/about/greeting",
    children: [
      { id: "about-greeting", label: "동창회장 인사말", to: "/about/greeting" },
      { id: "about-organization", label: "동창회 조직", to: "/about/organization" },
      { id: "about-bylaws", label: "동창회 정관", to: "/about/bylaws" },
      { id: "about-contact", label: "CONTACT US", to: "/about/contact" },
    ],
  },
  {
    id: "board-notice",
    label: "알림",
    to: "/board/notice",
    children: [
      { id: "notice-main", label: "공지사항", to: "/board/Notice" },
      { id: "notice-alumni", label: "동문 소식", to: "/board/AlumniNews" },
      { id: "notice-chemeng", label: "동문 경조사", to: "/board/Chemengnews" },
      { id: "notice-schedule", label: "동창회 일정", to: "/events" },
    ],
  },
  {
    id: "community",
    label: "커뮤니티",
    to: "/board/Freeboard",
    children: [
      { id: "community-free", label: "자유게시판", to: "/board/Freeboard" },
      { id: "community-mentoring", label: "선·후배님 도와주세요", to: "/community/mentoring" },
      { id: "community-photo", label: "사진게시판", to: "/board/Photoboard" },
      { id: "community-meeting", label: "소모임 게시판", to: "/board/Metting" },
      { id: "community-column", label: "동문 컬럼", to: "/board/Column" },
    ],
  },
  {
    id: "search",
    label: "찾아보기",
    to: "/search",
    children: [
      { id: "search-alumni", label: "동문 검색하기", to: "/search/alumni" },
      { id: "search-sponsors", label: "후원기업", to: "/sponsors" },
      { id: "search-related", label: "관련사이트", to: "/familysites" },
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
