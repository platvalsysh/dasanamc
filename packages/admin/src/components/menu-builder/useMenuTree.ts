import { useEffect, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

/**
 * 메뉴 트리 한 그루를 관리하는 hook. 사이트 메뉴 빌더 / 관리자 메뉴 빌더가
 * 공유하는 공용 로직을 한 곳에 모았다.
 *
 * 다루는 상태:
 *  - `items`: 현재 트리
 *  - `expandedItems`: 어떤 부모 노드가 펼쳐졌는지
 *
 * 노출하는 mutation:
 *  - `handleDelete(index, parentId)`
 *  - `handleMove(index, "up"|"down", parentId)`
 *  - `handleDragEnd(event)`
 *  - `handleAddChild(targetParentId, newItem)`
 *  - `handleEdit(parentId, index, updater)`
 *  - `toggleExpand(id)` / `expandAll` / `collapseAll`
 *
 * `T` 는 `{ id, children? }` 를 만족하는 임의의 메뉴 아이템 타입.
 * 사이트 메뉴(`SiteMenuConfigItem`) 와 관리자 메뉴(`AdminMenuConfigItem`)
 * 모두 같은 hook 으로 처리.
 */
export interface MenuTreeItem {
  id: string;
  children?: MenuTreeItem[];
}

export function useMenuTree<T extends MenuTreeItem>(initial: T[]) {
  const [items, setItems] = useState<T[]>(initial);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    return collectExpandableIds(initial);
  });

  // 외부에서 새 initial 이 들어오면 동기화 (loader 재실행 결과 등)
  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedItems(collectExpandableIds(items));
  const collapseAll = () => setExpandedItems(new Set());

  const modify = (
    parentId: string,
    callback: (siblings: T[]) => T[],
  ): void => {
    setItems((prev) => modifyConfig(prev, parentId, callback));
  };

  const handleDelete = (index: number, parentId: string) => {
    modify(parentId, (siblings) => {
      const next = [...siblings];
      next.splice(index, 1);
      return next;
    });
  };

  const handleMove = (
    index: number,
    direction: "up" | "down",
    parentId: string,
  ) => {
    modify(parentId, (siblings) => {
      const next = [...siblings];
      if (direction === "up" && index > 0) {
        [next[index], next[index - 1]] = [next[index - 1], next[index]];
      } else if (direction === "down" && index < next.length - 1) {
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
      }
      return next;
    });
  };

  const handleAddChild = (targetParentId: string, newItem: T) => {
    modify(targetParentId, (siblings) => [...siblings, newItem]);
    // 새 자식 추가 시 부모 펼침
    if (targetParentId !== "root") {
      setExpandedItems((prev) => new Set([...prev, targetParentId]));
    }
  };

  const handleEdit = (parentId: string, index: number, updater: T) => {
    modify(parentId, (siblings) => {
      const next = [...siblings];
      // 기존 children 보존
      next[index] = { ...updater, children: siblings[index].children };
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const parentId = findParentId(items, activeId);
    if (!parentId) return;
    modify(parentId, (siblings) => {
      const oldIndex = siblings.findIndex((s) => s.id === activeId);
      const newIndex = siblings.findIndex((s) => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return siblings;
      return arrayMove(siblings, oldIndex, newIndex);
    });
  };

  return {
    items,
    setItems,
    expandedItems,
    toggleExpand,
    expandAll,
    collapseAll,
    handleDelete,
    handleMove,
    handleAddChild,
    handleEdit,
    handleDragEnd,
  };
}

/** 트리에서 children 을 가진 부모 노드의 id 들을 모음 — 기본 펼침 상태 계산용. */
export function collectExpandableIds<T extends MenuTreeItem>(
  list: T[],
): Set<string> {
  const ids = new Set<string>();
  const traverse = (xs: MenuTreeItem[]) => {
    xs.forEach((x) => {
      if (x.children && x.children.length > 0) {
        ids.add(x.id);
        traverse(x.children);
      }
    });
  };
  traverse(list);
  return ids;
}

/**
 * 트리의 deep modify. `parentId === "root"` 이면 최상위, 아니면 그 id 를
 * 가진 노드의 children 에 `callback` 을 적용. 불변 갱신.
 */
export function modifyConfig<T extends MenuTreeItem>(
  config: T[],
  parentId: string,
  callback: (siblings: T[]) => T[],
): T[] {
  if (parentId === "root") return callback(config);
  return config.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: callback((item.children ?? []) as T[]) };
    }
    if (item.children) {
      return {
        ...item,
        children: modifyConfig(item.children as T[], parentId, callback),
      };
    }
    return item;
  });
}

/**
 * 주어진 id 가 어느 부모의 children 에 속하는지 검색. 최상위면 `"root"`.
 */
export function findParentId<T extends MenuTreeItem>(
  items: T[],
  id: string,
): string | null {
  if (items.some((i) => i.id === id)) return "root";
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      if (item.children.some((c) => c.id === id)) return item.id;
      const found = findParentId(item.children as T[], id);
      if (found) return found;
    }
  }
  return null;
}
