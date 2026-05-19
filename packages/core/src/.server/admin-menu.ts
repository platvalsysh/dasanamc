import { configManager } from "./ConfigManager";
import { moduleManager } from "./ModuleManager";
import type { AdminMenuConfigItem } from "../types";

/**
 * 관리자 사이드바 메뉴를 반환한다.
 *
 * 우선순위:
 *   1. DB 의 `site.adminMenu` config 가 있고 **비어있지 않으면** 그것
 *      (관리자가 메뉴 빌더로 커스터마이즈한 상태)
 *   2. 그 외에는 활성 모듈이 선언한 `adminMenuItemUnits` 를 합성한 선언적 트리
 *
 * 즉 신규 외주는 별도 설정 없이도 활성 모듈의 메뉴가 자동 노출되고, 관리자가
 * 메뉴 빌더에서 손대면 그 결과가 영구 저장. 빈 배열 저장으로 "선언적 트리로
 * 리셋" 효과를 낼 수 있다 ({@link resetAdminMenu} 참고).
 *
 * 이전의 `DEFAULT_MENU_CONFIG` (상점/상품/주문 등 chemeng 잔재) 는 폐기됨.
 */
export async function getAdminMenu(): Promise<AdminMenuConfigItem[]> {
  const declarative = moduleManager.getAdminMenuTree();
  const override = await configManager.get<AdminMenuConfigItem[] | null>(
    "site",
    "adminMenu",
    null,
  );
  if (override && override.length > 0) {
    return override;
  }
  return declarative;
}

/**
 * 관리자가 메뉴 빌더에서 저장. DB 의 `site.adminMenu` 에 영구 보관.
 */
export async function setAdminMenu(menu: AdminMenuConfigItem[]): Promise<void> {
  await configManager.set(
    "site",
    "adminMenu",
    menu,
    "Admin menu configuration (override of declarative module menu tree)",
  );
}

/**
 * 오버라이드를 빈 배열로 저장 → `getAdminMenu` 가 선언적 트리로 fallback.
 */
export async function resetAdminMenu(): Promise<void> {
  await setAdminMenu([]);
}
