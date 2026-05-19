import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import {
  getAdminMenu,
  setAdminMenu,
  resetAdminMenu,
  moduleManager,
} from "@repo/core/server";
import {
  Save,
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  FileText,
  Edit,
} from "lucide-react";
import type {
  AdminMenuConfigItem,
  Permission,
  AdminMenuItemUnit,
} from "@repo/core/types";
import { getIcons, getIcon, t } from "@repo/core/ui";
import { useState, useEffect } from "react";
import React from "react";
import Select from "react-select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const config = await getAdminMenu();
  const modules = moduleManager.getModules();

  const groupedPermissions = Object.values(modules)
    .filter((m) => m.permissions && m.permissions.length > 0)
    .map((m) => ({
      module: m.name,
      permissions: m.permissions!,
    }));

  const groupedAvailableMenus = Object.values(modules)
    .filter((m) => m.adminMenuItemUnits && m.adminMenuItemUnits.length > 0)
    .map((m) => ({
      module: m.name,
      items: m.adminMenuItemUnits!,
    }));

  // 모듈 선언 path 집합 — 메뉴 빌더에서 "라우트 없음" 배지로 활용
  const declaredPaths = new Set<string>();
  for (const m of Object.values(modules)) {
    for (const unit of m.adminMenuItemUnits ?? []) {
      if (unit.path) declaredPaths.add(unit.path);
    }
  }

  return {
    config,
    groupedPermissions,
    groupedAvailableMenus,
    declaredPaths: Array.from(declaredPaths),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "reset") {
    await resetAdminMenu();
    return { success: true, reset: true };
  }

  const configJson = formData.get("configJson") as string;

  let newConfig: AdminMenuConfigItem[];
  try {
    newConfig = JSON.parse(configJson);
  } catch (e) {
    return { success: false, error: "Invalid JSON format" };
  }

  await setAdminMenu(newConfig);

  return { success: true, config: newConfig };
};

// --- Types ---
type MenuFlatItem = AdminMenuConfigItem & { depth: number; parentId?: string };

// --- Components ---

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: AdminMenuConfigItem) => void;
  initialItem?: AdminMenuConfigItem | null; // If null, creating new
  groupedAvailableMenus: { module: string; items: readonly AdminMenuItemUnit[] }[];
  groupedPermissions: { module: string; permissions: readonly Permission[] }[];
  icons: string[];
}

function MenuItemDialog({
  isOpen,
  onClose,
  onSave,
  initialItem,
  groupedAvailableMenus,
  groupedPermissions,
  icons,
}: MenuItemDialogProps) {
  const [formData, setFormData] = useState<AdminMenuConfigItem>({
    id: "",
    label: "",
    path: "",
    icon: "",
    permission: undefined,
  });
  const [mode, setMode] = useState<"edit" | "create_select" | "create_custom">(
    "create_select",
  );
  const [menuSearch, setMenuSearch] = useState(""); // Add search state

  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setMode("edit");
        setFormData({ ...initialItem });
      } else {
        setMode("create_select");
        setFormData({
          id: `menu-${Date.now()}`,
          label: "",
          path: "",
          icon: "",
        });
      }
    }
  }, [isOpen, initialItem]);

  const handleFieldChange = (field: keyof AdminMenuConfigItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectModule = (unit: AdminMenuItemUnit) => {
    setFormData({
      id: unit.id,
      label: unit.label,
      icon: unit.icon ?? "",
      path: unit.path,
      permission: unit.permission,
      children: [],
    });
    setMode("edit"); // Proceed to edit details if needed, or just save? Let's go to edit review
  };

  const handleCreateCustom = () => {
    setFormData({
      id: `menu-${Date.now()}`,
      label: "New Menu",
      icon: "LayoutDashboard",
      path: "/admin/new",
      children: [],
    });
    setMode("edit");
  };

  if (!isOpen) return null;

  // Filter available menus
  const lowerSearch = menuSearch.toLowerCase();
  const filteredAvailableMenus = groupedAvailableMenus
      .map(group => {
          // If module name matches, show all items
          if (group.module.toLowerCase().includes(lowerSearch)) {
              return group;
          }
          return {
              ...group,
              items: group.items.filter(item =>
                  item.label.toLowerCase().includes(lowerSearch) ||
                  (item.path?.toLowerCase().includes(lowerSearch) ?? false)
              )
          };
      })
      .filter(group => group.items.length > 0);
      
  const permissionOptions = groupedPermissions.map(group => ({
      label: group.module,
      options: group.permissions.map(p => ({ label: p.name, value: p.name, module: group.module }))
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
          <h3 className="text-lg font-semibold">
            {initialItem ? "메뉴 항목 수정" : "메뉴 항목 추가"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-gray-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {mode === "create_select" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-700">
                  <FileText className="h-4 w-4" /> 사용자 지정 메뉴
                </h4>
                <button
                  onClick={handleCreateCustom}
                  className="group flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-4 text-center transition-all hover:border-blue-500 hover:bg-blue-50"
                >
                  <div className="rounded-full bg-gray-100 p-3 text-gray-400 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-blue-700">
                    빈 항목 추가
                  </span>
                </button>
              </div>
              <div>
                <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-700">
                </h4>
                <div className="mb-2">
                    <input 
                        type="text" 
                        placeholder="Search modules..." 
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        list="module-list"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                    <datalist id="module-list">
                        {groupedAvailableMenus.map(g => <option key={g.module} value={g.module} />)}
                    </datalist>
                </div>
                <div className="max-h-[300px] space-y-4 overflow-y-auto pr-2">
                  {filteredAvailableMenus.length > 0 ? (
                    filteredAvailableMenus.map((group) => (
                      <div key={group.module} className="space-y-1">
                          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">{group.module}</h5>
                          {group.items.map((unit) => (
                            <button
                                key={unit.id}
                                onClick={() => handleSelectModule(unit)}
                                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 text-left transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm"
                            >
                                <div className="shrink-0 rounded-md bg-blue-50 p-2 text-blue-600">
                                {unit.icon ? getIcon(unit.icon, "w-4 h-4") : null}
                                </div>
                                <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-gray-900">
                                    {unit.label}
                                </div>
                                {unit.path && (
                                <div className="truncate font-mono text-xs text-gray-500">
                                    {unit.path}
                                </div>
                                )}
                                </div>
                            </button>
                          ))}
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-sm text-gray-400 italic">
                      No matching modules found
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Edit Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Label
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => handleFieldChange("label", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Path
                  </label>
                  <input
                    type="text"
                    value={formData.path || ""}
                    onChange={(e) => handleFieldChange("path", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 font-mono shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Icon
                  </label>
                  <div className="mt-1 flex gap-2">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50">
                        {formData.icon ? getIcon(formData.icon, "w-5 h-5") : <div className="w-5 h-5" />}
                     </div>
                    <select
                      value={formData.icon || ""}
                      onChange={(e) => handleFieldChange("icon", e.target.value)}
                      className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">No Icon</option>
                      {icons.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleFieldChange("id", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 font-mono shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                  <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Permissions
                  </label>
                   <Select
                      isMulti
                      options={permissionOptions}
                      filterOption={(candidate, input) => {
                          if (input) {
                              const lowerInput = input.toLowerCase();
                              // Check option label
                              if (candidate.label.toLowerCase().includes(lowerInput)) return true;
                              // Check module name (custom data)
                              const moduleName = (candidate.data as any).module;
                              if (moduleName && moduleName.toLowerCase().includes(lowerInput)) return true;
                              return false;
                          }
                          return true;
                      }}
                      value={
                        Array.isArray(formData.permission)
                          ? formData.permission.map((p) => ({ value: p, label: p }))
                          : formData.permission
                            ? [{ value: formData.permission, label: formData.permission }]
                            : []
                      }
                      onChange={(newValue) => {
                        const selectedValues = newValue.map((v: any) => v.value);
                        handleFieldChange(
                          "permission",
                          selectedValues.length > 0 ? selectedValues : undefined,
                        );
                      }}
                      className="mt-1 text-sm"
                      placeholder="(Public - No restrictions)"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {t("common.cancel")}
          </button>
          {mode === "edit" && (
            <button
              onClick={() => onSave(formData)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {initialItem ? t("common.save_changes") : t("common.create_item")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface MenuItemRowProps {
  item: AdminMenuConfigItem;
  depth: number;
  onEdit: () => void;
  onDelete: () => void;
  onAddChild: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isDeadLink: boolean;
  dragHandleProps?: any; // DndKit attributes
}

function MenuItemRow({
  item,
  depth,
  onEdit,
  onDelete,
  onAddChild,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpand,
  isDeadLink,
  dragHandleProps,
}: MenuItemRowProps) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="group flex items-center border-b border-gray-100 bg-white py-2 transition-colors hover:bg-gray-50">
      {/* Indentation */}
      <div style={{ width: depth * 24 + 12 }} className="shrink-0" />

      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="mr-2 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Expand Toggle */}
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

      {/* Icon */}
      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-500">
        {item.icon ? getIcon(item.icon, "w-4 h-4") : <div className="h-4 w-4" />}
      </div>

      {/* Label & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
            <span className={`font-medium ${isDeadLink ? "text-gray-400 line-through" : "text-gray-900"}`}>{item.label}</span>
            <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{item.path}</span>
            {isDeadLink && (
              <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                활성 모듈에 없음
              </span>
            )}
        </div>
        {item.permission && (
            <div className="text-[10px] text-blue-500 flex gap-1 items-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"/>
                 {Array.isArray(item.permission) ? item.permission.join(", ") : item.permission}
            </div>
        )}
      </div>

      {/* Actions */}
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
  );
}

// DnD Sortable Wrapper for Row
function SortableMenuItem({
    item,
    depth,
    index,
    isExpanded,
    onToggleExpand,
    ...props
}: MenuItemRowProps & { id: string, index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 1000 : "auto",
        position: "relative" as const,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <MenuItemRow
                item={item}
                depth={depth}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
                dragHandleProps={{...attributes, ...listeners}}
                {...props}
            />
        </div>
    );
}

function RecursiveSortableList({
    items,
    depth = 0,
    parentId,
    onDelete,
    onAddChild,
    onMove,
    onEdit,
    expandedItems,
    toggleExpand,
    declaredPathsSet,
}: {
    items: AdminMenuConfigItem[];
    depth?: number;
    parentId: string;
    onDelete: (index: number, parentId: string) => void;
    onAddChild: (targetParentId: string) => void;
    onMove: (index: number, direction: "up" | "down", parentId: string) => void;
    onEdit: (item: AdminMenuConfigItem, parentId: string, index: number) => void;
    expandedItems: Set<string>;
    toggleExpand: (id: string) => void;
    declaredPathsSet: Set<string>;
}) {

    return (
        <SortableContext
            items={items.map((it) => it.id)}
            strategy={verticalListSortingStrategy}
        >
            <div className={`flex flex-col ${depth > 0 ? "relative" : ""}`}>
                {/* Visual Guide line for children */}
                {depth > 0 && <div className="absolute left-0 top-0 bottom-0 border-l border-gray-200" style={{ left: (depth * 24) - 12 }} />}

                {items.map((item, i) => {
                    // dead-link 판정: path 가 있고 활성 모듈 어디에서도 선언 안 됨
                    const isDeadLink = !!item.path && !declaredPathsSet.has(item.path);
                    return (
                    <React.Fragment key={item.id}>
                        <SortableMenuItem
                            id={item.id}
                            item={item}
                            index={i}
                            depth={depth}
                            isFirst={i === 0}
                            isLast={i === items.length - 1}
                            onEdit={() => onEdit(item, parentId, i)}
                            onDelete={() => onDelete(i, parentId)}
                            onAddChild={() => onAddChild(item.id)}
                            onMoveUp={() => onMove(i, "up", parentId)}
                            onMoveDown={() => onMove(i, "down", parentId)}
                            isExpanded={expandedItems.has(item.id)}
                            onToggleExpand={() => toggleExpand(item.id)}
                            isDeadLink={isDeadLink}
                        />
                        {item.children && item.children.length > 0 && expandedItems.has(item.id) && (
                           <RecursiveSortableList
                              items={item.children}
                              depth={depth + 1}
                              parentId={item.id}
                              onDelete={onDelete}
                              onAddChild={onAddChild}
                              onMove={onMove}
                              onEdit={onEdit}
                              expandedItems={expandedItems}
                              toggleExpand={toggleExpand}
                              declaredPathsSet={declaredPathsSet}
                           />
                        )}
                    </React.Fragment>
                    );
                })}
            </div>
        </SortableContext>
    );
}


export default function MenuSettings() {
  const { config, groupedPermissions, groupedAvailableMenus, declaredPaths } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const declaredPathsSet = new Set(declaredPaths);

  // 메뉴 안에 dead-link (활성 모듈에 없는 path) 가 하나라도 있나
  const hasDeadLink = (() => {
    const traverse = (items: AdminMenuConfigItem[]): boolean => {
      for (const it of items) {
        if (it.path && !declaredPathsSet.has(it.path)) return true;
        if (it.children && traverse(it.children)) return true;
      }
      return false;
    };
    return traverse(config || []);
  })();

  const [menuConfig, setMenuConfig] = useState<AdminMenuConfigItem[]>(
    config || [],
  );
  const [jsonMode, setJsonMode] = useState(false);
  const icons = getIcons();
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    // Collect all parent IDs to expand by default
    const allIds = new Set<string>();
    const traverse = (items: AdminMenuConfigItem[]) => {
        items.forEach(item => {
            if (item.children && item.children.length > 0) {
                allIds.add(item.id);
                traverse(item.children);
            }
        });
    };
    traverse(config || []);
    return allIds;
  });
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItemInfo, setEditingItemInfo] = useState<{
      item: AdminMenuConfigItem | null,
      parentId: string | null,
      index: number | null
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ index: number, parentId: string } | null>(null);

  useEffect(() => {
    if (actionData?.config) {
      setMenuConfig(actionData.config);
    } else if (config) {
      setMenuConfig(config);
    }
  }, [config, actionData]);

  const toggleExpand = (id: string) => {
      const newSet = new Set(expandedItems);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setExpandedItems(newSet);
  };

  const getAllIds = (items: AdminMenuConfigItem[]) => {
      const allIds = new Set<string>();
      const traverse = (list: AdminMenuConfigItem[]) => {
          list.forEach(item => {
              if (item.children && item.children.length > 0) {
                  allIds.add(item.id);
                  traverse(item.children);
              }
          });
      };
      traverse(items);
      return allIds;
  };

  const handleExpandAll = () => {
      setExpandedItems(getAllIds(menuConfig));
  };

  const handleCollapseAll = () => {
      setExpandedItems(new Set());
  };

  // Helper to deep modify config
  const modifyConfig = (
      config: AdminMenuConfigItem[],
      parentId: string,
      callback: (siblings: AdminMenuConfigItem[]) => AdminMenuConfigItem[]
  ): AdminMenuConfigItem[] => {
      if (parentId === "root") {
          return callback(config);
      }
      return config.map(item => {
          if (item.id === parentId) {
             return { ...item, children: callback(item.children || []) };
          }
          if (item.children) {
             return { ...item, children: modifyConfig(item.children, parentId, callback) };
          }
          return item;
      });
  };

  const handleDelete = (index: number, parentId: string) => {
      setDeleteTarget({ index, parentId });
  };
  
  const confirmDelete = () => {
      if (!deleteTarget) return;
      const { index, parentId } = deleteTarget;
      setMenuConfig(prev => modifyConfig(prev, parentId, (siblings) => {
          const newSiblings = [...siblings];
          newSiblings.splice(index, 1);
          return newSiblings;
      }));
      setDeleteTarget(null);
  };

  const handleMove = (index: number, direction: "up" | "down", parentId: string) => {
      setMenuConfig(prev => modifyConfig(prev, parentId, (siblings) => {
          const newSiblings = [...siblings];
          if (direction === "up" && index > 0) {
              [newSiblings[index], newSiblings[index - 1]] = [newSiblings[index - 1], newSiblings[index]];
          } else if (direction === "down" && index < newSiblings.length - 1) {
              [newSiblings[index], newSiblings[index + 1]] = [newSiblings[index + 1], newSiblings[index]];
          }
          return newSiblings;
      }));
  };

  // Drag End Handler
  const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      // Find parent of active item? 
      // This is the tricky part with recursive lists if we don't know the parent easily.
      // But we constrained drag to SortableContext which is per-list.
      // So dnd-kit assumes items in same Context are siblings.
      // However, we need to find WHICH list they belong to in our state tree.
      
      const findParentId = (items: AdminMenuConfigItem[], id: string): string | null => {
        for (const item of items) {
           if (item.id === id) return "root"; // Top level check handled outside? No, wait.
           if (item.children) {
               if (item.children.some(child => child.id === id)) return item.id;
               const foundDetails = findParentId(item.children, id);
               if (foundDetails) return foundDetails;
           }
        }
        // Top level check in array
        if (items.some(i => i.id === id)) return "root";
        return null;
      };

      const parentId = findParentId(menuConfig, active.id as string);
      
      // We assume dragging only happens within same parent for this simple implementation
      // because sorting across parents requires connecting sortable contexts.
      
      if (parentId) {
          setMenuConfig(prev => modifyConfig(prev, parentId, (siblings) => {
              const oldIndex = siblings.findIndex(x => x.id === active.id);
              const newIndex = siblings.findIndex(x => x.id === over.id);
              return arrayMove(siblings, oldIndex, newIndex);
          }));
      }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Dialog Actions
  const openAddTopLevel = () => {
    setEditingItemInfo({ item: null, parentId: "root", index: null });
    setIsDialogOpen(true);
  };
  
  const openAddChild = (targetParentId: string) => {
      setEditingItemInfo({ item: null, parentId: targetParentId, index: null });
      setIsDialogOpen(true);
      // Auto expand to show the new child after adding is handled in save
  };
  
 const handleEdit = (item: AdminMenuConfigItem, parentId: string, index: number) => {
    setEditingItemInfo({ item, parentId, index });
    setIsDialogOpen(true);
 };
 
 const handleSaveDialog = (newItem: AdminMenuConfigItem) => {
     if (editingItemInfo?.index !== null && editingItemInfo?.index !== undefined && editingItemInfo?.parentId && editingItemInfo.item) {
         // EDIT MODE
         setMenuConfig(prev => modifyConfig(prev, editingItemInfo.parentId!, (siblings) => {
             const newSiblings = [...siblings];
             // Preserve children when editing properties
             const idx = editingItemInfo.index!;
             newSiblings[idx] = { ...newItem, children: siblings[idx].children };
             return newSiblings;
         }));
     } else if (editingItemInfo?.parentId) {
         // ADD CHILD MODE
         setMenuConfig(prev => modifyConfig(prev, editingItemInfo.parentId!, (siblings) => {
             return [...siblings, newItem];
         }));
         // Auto expand parent
         if(editingItemInfo.parentId !== "root") toggleExpand(editingItemInfo.parentId);
     }
     setIsDialogOpen(false);
 };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("configJson", JSON.stringify(menuConfig));
    submit(formData, { method: "post" });
  };



  const handleReset = () => {
    if (!confirm("저장된 메뉴 설정을 비우고 활성 모듈이 선언한 기본 메뉴 트리로 되돌립니다. 계속할까요?")) return;
    const formData = new FormData();
    formData.append("intent", "reset");
    submit(formData, { method: "post" });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            메뉴 구성 설정
          </h3>
          <p className="text-sm text-gray-600">
            관리자 페이지의 사이드바 메뉴 구조를 설정합니다. 저장 안 하면 활성 모듈 선언이 자동 반영.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!jsonMode && (
            <>
              <button
                type="button"
                onClick={handleExpandAll}
                className="rounded border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                전체 펼치기
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="rounded border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                전체 접기
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
            </>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm text-orange-700 hover:bg-orange-100"
            title="저장된 메뉴 설정을 비우고 활성 모듈 선언 기본값으로 되돌림"
          >
            기본값으로 리셋
          </button>
          <button
            type="button"
            onClick={() => setJsonMode(!jsonMode)}
            className="rounded border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
          >
            {jsonMode ? "UI 모드로 보기" : "JSON으로 보기"}
          </button>
        </div>
      </div>

      {hasDeadLink && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-800 border border-orange-200">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">활성 모듈에 없는 메뉴 항목이 있습니다</p>
            <p className="mt-1 text-xs">
              빨간 배지가 붙은 항목은 모듈이 더 이상 선언하지 않는 라우트입니다.
              삭제하거나 <span className="font-medium">기본값으로 리셋</span> 으로 일괄 정리하세요.
            </p>
          </div>
        </div>
      )}

      {actionData?.error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5" />
          {actionData.error}
        </div>
      )}

      <div className="flex-1 overflow-auto pb-20">
        {jsonMode ? (
          <div className="relative h-full overflow-hidden rounded-lg border border-gray-300">
            <textarea
              value={JSON.stringify(menuConfig, null, 2)}
              className="h-full min-h-[500px] w-full bg-gray-50 p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              spellCheck={false}
              readOnly={true}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
             
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                  <RecursiveSortableList
                      items={menuConfig}
                      parentId="root"
                      onDelete={handleDelete}
                      onAddChild={openAddChild}
                      onMove={handleMove}
                      onEdit={handleEdit}
                      expandedItems={expandedItems}
                      toggleExpand={toggleExpand}
                      declaredPathsSet={declaredPathsSet}
                  />
              </DndContext>
            </div>

            <button
               type="button"
               onClick={openAddTopLevel}
               className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 font-medium text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-600"
             >
               <Plus className="h-5 w-5" /> 최상위 메뉴 추가
             </button>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 mt-auto flex gap-3 border-t border-gray-200 bg-white pt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "저장 중..." : "변경사항 저장"}
        </button>
      </div>

      <MenuItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveDialog}
        initialItem={editingItemInfo?.item}
        groupedAvailableMenus={groupedAvailableMenus}
        groupedPermissions={groupedPermissions}
        icons={icons}
      />
      
      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl">
             <div className="p-6">
                 <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto">
                     <AlertCircle className="h-6 w-6 text-red-600" />
                 </div>
                 <h3 className="text-center text-lg font-semibold text-gray-900">항목 삭제</h3>
                 <p className="mt-2 text-center text-sm text-gray-500">
                     정말 이 메뉴 항목을 삭제하시겠습니까? <br/>
                     하위 메뉴가 있다면 함께 삭제됩니다.
                 </p>
             </div>
             <div className="flex border-t border-gray-100 bg-gray-50 p-4 gap-3">
                 <button 
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                 >
                     취소
                 </button>
                 <button 
                    onClick={confirmDelete}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700"
                 >
                     삭제
                 </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

