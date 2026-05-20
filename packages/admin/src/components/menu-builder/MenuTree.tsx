import React from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { ClientOnly } from "../ClientOnly";
import type { MenuTreeItem } from "./useMenuTree";

/**
 * 사이트 메뉴 빌더 / 관리자 메뉴 빌더가 공유하는 트리 렌더링 컴포넌트.
 *
 * 호출자는 단일 메뉴 트리 한 그루 + 액션 콜백 + 행 라벨 render prop 을
 * 제공. DnD context + sortable + 펼침 토글 + 액션 버튼은 내부에서 처리.
 *
 * `ClientOnly` 로 감싸 SSR/CSR hydration 시점 차이로 인한 dnd-kit
 * `aria-describedby` 카운터 mismatch 회피.
 */
export interface MenuTreeProps<T extends MenuTreeItem> {
  items: T[];
  expandedItems: Set<string>;
  toggleExpand: (id: string) => void;
  onEdit: (item: T, parentId: string, index: number) => void;
  onDelete: (index: number, parentId: string) => void;
  onAddChild: (targetParentId: string) => void;
  onMove: (index: number, direction: "up" | "down", parentId: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  /**
   * 호출자(페이지)가 직접 `useSensors(...)` 호출해서 전달. admin 패키지 내부
   * 컴포넌트에서 hook 호출 시 react 인스턴스 분리(invalid hook call) 회피.
   */
  sensors: SensorDescriptor<SensorOptions>[];
  /** 한 행의 라벨 영역 렌더. label/path/배지 등 페이지별 커스텀. */
  renderLabel: (item: T) => React.ReactNode;
}

export function MenuTree<T extends MenuTreeItem>(props: MenuTreeProps<T>) {
  return (
    <ClientOnly
      fallback={
        <div className="p-6 text-center text-sm text-gray-400">
          메뉴 트리 로딩 중...
        </div>
      }
    >
      <DndContext
        sensors={props.sensors}
        collisionDetection={closestCenter}
        onDragEnd={props.onDragEnd}
      >
        <RecursiveSortableList parentId="root" {...props} />
      </DndContext>
    </ClientOnly>
  );
}

interface RecursiveListProps<T extends MenuTreeItem>
  extends Omit<MenuTreeProps<T>, "items" | "sensors"> {
  items: T[];
  parentId: string;
  depth?: number;
}

function RecursiveSortableList<T extends MenuTreeItem>({
  items,
  parentId,
  depth = 0,
  expandedItems,
  toggleExpand,
  onEdit,
  onDelete,
  onAddChild,
  onMove,
  renderLabel,
  onDragEnd,
}: RecursiveListProps<T>) {
  return (
    <SortableContext
      items={items.map((it) => it.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className={`flex flex-col ${depth > 0 ? "relative" : ""}`}>
        {depth > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 border-l border-gray-200"
            style={{ left: depth * 24 - 12 }}
          />
        )}

        {items.map((item, i) => (
          <React.Fragment key={item.id}>
            <SortableMenuItem
              id={item.id}
              item={item}
              depth={depth}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              isExpanded={expandedItems.has(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
              onEdit={() => onEdit(item, parentId, i)}
              onDelete={() => onDelete(i, parentId)}
              onAddChild={() => onAddChild(item.id)}
              onMoveUp={() => onMove(i, "up", parentId)}
              onMoveDown={() => onMove(i, "down", parentId)}
              renderLabel={renderLabel}
            />
            {item.children &&
              item.children.length > 0 &&
              expandedItems.has(item.id) && (
                <RecursiveSortableList
                  items={item.children as T[]}
                  parentId={item.id}
                  depth={depth + 1}
                  expandedItems={expandedItems}
                  toggleExpand={toggleExpand}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  onMove={onMove}
                  renderLabel={renderLabel}
                  onDragEnd={onDragEnd}
                />
              )}
          </React.Fragment>
        ))}
      </div>
    </SortableContext>
  );
}

interface SortableMenuItemProps<T extends MenuTreeItem> {
  id: string;
  item: T;
  depth: number;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddChild: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  renderLabel: (item: T) => React.ReactNode;
}

function SortableMenuItem<T extends MenuTreeItem>({
  id,
  item,
  depth,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddChild,
  onMoveUp,
  onMoveDown,
  renderLabel,
}: SortableMenuItemProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : "auto",
    position: "relative" as const,
  };

  const hasChildren = !!(item.children && item.children.length > 0);

  return (
    <div ref={setNodeRef} style={style}>
      <div className="group flex items-center border-b border-gray-100 bg-white py-2 transition-colors hover:bg-gray-50">
        <div style={{ width: depth * 24 + 12 }} className="shrink-0" />

        <div
          {...attributes}
          {...listeners}
          className="mr-2 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <button
          onClick={onToggleExpand}
          className={`mr-2 flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-600 ${!hasChildren ? "invisible" : ""}`}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <div className="flex-1 min-w-0">{renderLabel(item)}</div>

        <div className="flex items-center gap-1 pr-4 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:invisible"
            title="Move Up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:invisible"
            title="Move Down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1 h-4 w-px bg-gray-200" />
          <button
            onClick={onAddChild}
            className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
            title="Add Sub Item"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onEdit}
            className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
