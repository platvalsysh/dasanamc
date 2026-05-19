import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import {
  useLoaderData,
} from "react-router";
import { getSiteMenus, setSiteMenu, moduleManager } from "@repo/core/server";
import { ClientOnly } from "../components/ClientOnly";
import {
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
  ExternalLink,
  Info
} from "lucide-react";
import type {
  SiteMenuConfigItem,
  SiteMenuItemUnit,
} from "@repo/core/types";
import { useState, useEffect } from "react";
import React from "react";
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

// Import prisma to query dynamic tables
import { prisma } from "@repo/database";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const menus = await getSiteMenus();
  const modules = moduleManager.getModules();
  
  // Use Promise.all to fetch dynamic items in parallel
  const groupedAvailableMenus = await Promise.all(
    Object.values(modules).map(async (m) => {
        let items: SiteMenuItemUnit[] = [];
        
        // 1. Static items logic provided by module definition
        if (m.siteMenuItemUnits) {
            for (const unit of m.siteMenuItemUnits) {
                const unitId = unit.id || crypto.randomUUID();
                
                if (unit.dynamic) {
                    try {
                        const { query, labelColumn, params } = unit.dynamic;
                        let results: any[] = [];

                        if (query) {
                             // Execute Raw Query
                             results = await prisma.$queryRawUnsafe(query);
                        }

                        if (results.length > 0) {
                            // Map results to menu items
                            const dynamicItems: SiteMenuItemUnit[] = results.map((row: any, index: number) => {
                                let path = unit.path || "";
                                
                                // Handle Parameter Replacement
                                if (params) {
                                    // Multiple params support: { "boardName": "mid" }
                                    Object.entries(params).forEach(([paramName, colName]) => {
                                        const val = row[colName];
                                        if (val !== undefined) {
                                            path = path.replace(`:${paramName}`, String(val));
                                        }
                                    });
                                }

                                // Use implicit ID or index
                                // We don't have idColumn anymore, so we use index or try to find an id-like field if we wanted to be smart,
                                // but index is stable enough for this list context usually.
                                // Actually, let's allow 'id' or 'mid' in row to be part of key if present for better stability?
                                // User said "idColumn unnecessary", implying we shouldn't care.
                                // index is fine.
                                
                                return {
                                    id: `${unitId}-${index}`, 
                                    label: row[labelColumn] || `Item ${index}`,
                                    path: path,
                                    permission: unit.permission
                                };
                            });
                            items.push(...dynamicItems);
                        }
                    } catch (e) {
                         console.error(`Failed to resolve dynamic menu for module ${m.name}:`, e);
                    }
                } else {
                    items.push({ ...unit, id: unitId });
                }
            }
        }
        
        return {
            module: m.name,
            items
        };
    })
  );

  // Filter out modules with no items
  const filteredGroups = groupedAvailableMenus.filter(g => g.items.length > 0);

  return { menus, groupedAvailableMenus: filteredGroups };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "save") {
    const configJson = formData.get("configJson") as string;
    const menuId = formData.get("menuId") as string;

    if (!menuId) return { success: false, error: "Missing menu ID" };

    let newItems: SiteMenuConfigItem[];
    try {
        newItems = JSON.parse(configJson);
    } catch (e) {
        return { success: false, error: "Invalid JSON format" };
    }

    await setSiteMenu(menuId, newItems);
    return { success: true };
  }
  
  if (intent === "create_location") {
      const menuId = formData.get("menuId") as string;
      if (!menuId) return { success: false, error: "Missing menu ID" };
      // Just saving an empty list creates it
      await setSiteMenu(menuId, []);
      return { success: true };
  }

  return { success: false };
};

// --- Components ---

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: SiteMenuConfigItem) => void;
  initialItem?: SiteMenuConfigItem | null; 
  groupedAvailableMenus: { module: string; items: readonly SiteMenuItemUnit[] }[];
}

function MenuItemDialog({
  isOpen,
  onClose,
  onSave,
  initialItem,
  groupedAvailableMenus,
}: MenuItemDialogProps) {
  const [formData, setFormData] = useState<SiteMenuConfigItem>({
    id: "",
    label: "",
    to: "",
  });
  const [mode, setMode] = useState<"edit" | "create_select">("create_select");
  const [menuSearch, setMenuSearch] = useState("");

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
          to: "",
        });
      }
    }
  }, [isOpen, initialItem]);

  const handleFieldChange = (field: keyof SiteMenuConfigItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectModule = (unit: SiteMenuItemUnit) => {
    const newItem: SiteMenuConfigItem = {
      id: unit.id + "-" + Date.now(), // unique ID based on unit ID
      label: unit.label,
      to: unit.path || "",
      children: [],
      permission: unit.permission ? (Array.isArray(unit.permission) ? unit.permission : [unit.permission]) : undefined
    };
    
    // Check for parameters, but ignore http:// or https://
    // Simple check: looking for /:param or just :param but avoiding protocol
    // A param usually follows a slash or start of string, e.g. /board/:id or :id
    // But absolute URL is https://...
    
    const isParam = (str: string) => {
        if (!str) return false;
        // if starts with http(s):, it's external link, unlikely to be our param route unless user explicitly types :param in query
        if (str.match(/^https?:\/\//)) return false;
        return str.includes(":");
    };

    if (newItem.to && isParam(newItem.to)) {
         // If path has params, go to edit mode to let user fill them
         setFormData(newItem);
         setMode("edit");
    } else {
        // Otherwise direct save? Or let them review? Let's let them review/edit label.
        setFormData(newItem);
        setMode("edit");
    }
  };

  const handleCreateCustom = () => {
    setFormData({
      id: `menu-${Date.now()}`,
      label: "New Menu",
      to: "/",
      children: [],
    });
    setMode("edit");
  };

  if (!isOpen) return null;

  const lowerSearch = menuSearch.toLowerCase();
  // ... (rest of search logic)

  // Validation helper for render
  const isParam = (str: string) => {
      if (!str) return false;
      if (str.match(/^https?:\/\//)) return false;
      return str.includes(":");
  };
  const filteredAvailableMenus = groupedAvailableMenus
      .map(group => {
          if (group.module.toLowerCase().includes(lowerSearch)) {
              return group;
          }
          return {
              ...group,
              items: group.items.filter(item => 
                  item.label.toLowerCase().includes(lowerSearch) || 
                  (item.path && item.path.toLowerCase().includes(lowerSearch))
              )
          };
      })
      .filter(group => group.items.length > 0);

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
                   가용 메뉴 목록
                </h4>
                <div className="mb-2">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
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
                                <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-gray-900">
                                    {unit.label}
                                </div>
                                {unit.path && <div className="truncate font-mono text-xs text-gray-500">
                                    {unit.path}
                                </div>}
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
                    Target Path (Link)
                  </label>
                  <input
                    type="text"
                    value={formData.to || ""}
                    onChange={(e) => handleFieldChange("to", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 font-mono shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {formData.to && isParam(formData.to) && (
                      <div className="mt-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                        <div className="flex items-start gap-2">
                           <Info className="h-4 w-4 mt-0.5 text-yellow-600" />
                           <div>
                             <p className="font-medium">Parameter Detected</p>
                             <p className="mt-1 text-xs opacity-90">
                               The path contains a parameter (starts with <code>:</code>). 
                               Please replace it with a specific value.<br/>
                               (e.g., change <code>/board/:boardName</code> to <code>/board/notice</code>)
                             </p>
                           </div>
                        </div>
                      </div>
                  )}
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700">
                    Open in
                   </label>
                   <select
                        value={formData.target || "_self"}
                        onChange={(e) => handleFieldChange("target", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm sm:text-sm"
                   >
                       <option value="_self">Current Window</option>
                       <option value="_blank">New Window</option>
                   </select>
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-gray-700">
                    Permission (Optional)
                   </label>
                   <input
                        type="text"
                        placeholder="e.g. core.manage_system"
                        value={Array.isArray(formData.permission) ? formData.permission.join(",") : (formData.permission || "")}
                        onChange={(e) => handleFieldChange("permission", e.target.value ? e.target.value.split(",") : undefined)}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                   />
                   {/* TODO: Add proper permission selector */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      (자동 생성, 수정 불가)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    readOnly
                    className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 p-2 font-mono text-gray-500 shadow-sm sm:text-sm"
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
            Cancel
          </button>
          {mode === "edit" && (
            <button
              onClick={() => onSave(formData)}
              disabled={!!(formData.to && isParam(formData.to))}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                formData.to && isParam(formData.to)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {initialItem ? "Save Changes" : "Create Item"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmDialog({ isOpen, onClose, onConfirm }: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="bg-gray-50 p-4 border-b border-gray-100">
           <h3 className="text-lg font-semibold text-gray-900">삭제 확인</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">
            정말 이 메뉴 항목을 삭제하시겠습니까? <br/>
            <span className="text-sm text-red-500 mt-2 block">* 하위 메뉴도 함께 삭제됩니다.</span>
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

interface MenuItemRowProps {
  item: SiteMenuConfigItem;
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
  dragHandleProps?: any;
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
  dragHandleProps,
}: MenuItemRowProps) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="group flex items-center border-b border-gray-100 bg-white py-2 transition-colors hover:bg-gray-50">
      <div style={{ width: depth * 24 + 12 }} className="shrink-0" />

      <div
        {...dragHandleProps}
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{item.label}</span>
            <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{item.to}</span>
            {item.target === "_blank" && <ExternalLink className="w-3 h-3 text-gray-400"/>}
            {item.permission && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">Locked</span>}
        </div>
      </div>

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
    parentId, // Corresponds to menu section ID if root, or item ID if nested
    contextId, // "header", "footer"
    onDelete,
    onAddChild,
    onMove,
    onEdit,
    expandedItems,
    toggleExpand,
}: {
    items: SiteMenuConfigItem[];
    depth?: number;
    parentId: string;
    contextId: string;
    onDelete: (index: number, parentId: string, contextId: string) => void;
    onAddChild: (targetParentId: string, contextId: string) => void;
    onMove: (index: number, direction: "up" | "down", parentId: string, contextId: string) => void;
    onEdit: (item: SiteMenuConfigItem, parentId: string, index: number, contextId: string) => void;
    expandedItems: Set<string>;
    toggleExpand: (id: string) => void;
}) {

    return (
        <SortableContext
            items={items.map((it) => it.id)}
            strategy={verticalListSortingStrategy}
        >
            <div className={`flex flex-col ${depth > 0 ? "relative" : ""}`}>
                {depth > 0 && <div className="absolute left-0 top-0 bottom-0 border-l border-gray-200" style={{ left: (depth * 24) - 12 }} />}
                
                {items.map((item, i) => (
                    <React.Fragment key={item.id}>
                        <SortableMenuItem
                            id={item.id}
                            item={item}
                            index={i}
                            depth={depth}
                            isFirst={i === 0}
                            isLast={i === items.length - 1}
                            onEdit={() => onEdit(item, parentId, i, contextId)}
                            onDelete={() => onDelete(i, parentId, contextId)}
                            onAddChild={() => onAddChild(item.id, contextId)}
                            onMoveUp={() => onMove(i, "up", parentId, contextId)}
                            onMoveDown={() => onMove(i, "down", parentId, contextId)}
                            isExpanded={expandedItems.has(item.id)}
                            onToggleExpand={() => toggleExpand(item.id)}
                        />
                        {item.children && item.children.length > 0 && expandedItems.has(item.id) && (
                           <RecursiveSortableList
                              items={item.children}
                              depth={depth + 1}
                              parentId={item.id}
                              contextId={contextId}
                              onDelete={onDelete}
                              onAddChild={onAddChild}
                              onMove={onMove}
                              onEdit={onEdit}
                              expandedItems={expandedItems}
                              toggleExpand={toggleExpand}
                           />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </SortableContext>
    );
}


export default function SiteMenuSettings() {

  const { menus, groupedAvailableMenus } = useLoaderData<typeof loader>();
  const [localMenus, setLocalMenus] = useState(menus);

  // Sync local state when loader data changes (initial load or navigation)
  useEffect(() => {
      setLocalMenus(menus);
  }, [menus]);

  // For saving changes, we'll use a fetcher or form submission per section?
  // User probably expects global save or per-section. "Save Changes" on dialog is local.
  // Let's implement auto-save or explicit save button per section?
  // Explicit save is safer.
  
  // Actually, we can just update localMenus and have a global "Save All" or individual "Save" buttons.
  // Individual "Save" per section is clearer.
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Expand all by default
  useEffect(() => {
    const allIds = new Set<string>();
    Object.values(localMenus).forEach(items => {
        const traverse = (list: SiteMenuConfigItem[]) => {
            list.forEach(item => {
                if (item.children && item.children.length > 0) {
                    allIds.add(item.id);
                    traverse(item.children);
                }
            });
        };
        traverse(items);
    });
    setExpandedItems(allIds);
  }, []); // Only on mount? Or when menus change? If menus change heavily, maybe re-expand.

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<{
      contextId: string, // menuId (header, footer)
      parentId: string | null, // parent ID (root node or item id)
      index: number | null,
      item: SiteMenuConfigItem | null
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ index: number, parentId: string, contextId: string } | null>(null);

  // Helper to modify config deep
  const modifyConfig = (
      config: SiteMenuConfigItem[],
      parentId: string, // "root" or item ID
      callback: (siblings: SiteMenuConfigItem[]) => SiteMenuConfigItem[]
  ): SiteMenuConfigItem[] => {
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

  const updateMenu = (menuId: string, updater: (prev: SiteMenuConfigItem[]) => SiteMenuConfigItem[]) => {
      setLocalMenus(prev => ({
          ...prev,
          [menuId]: updater(prev[menuId] || [])
      }));
  };

  const handleCreateMenuLocation = () => {
      const id = prompt("추가할 메뉴 위치 ID를 입력하세요 (예: sidebar)");
      if (!id) return;
      if (localMenus[id]) {
          alert("이미 존재하는 ID입니다.");
          return;
      }
      setLocalMenus(prev => ({ ...prev, [id]: [] }));
      // Trigger create in backend?
      // For now we just add it to local state. User needs to adding items then save to persist? 
      // Or we can save empty list immediately.
      const formData = new FormData();
      formData.append("intent", "create_location");
      formData.append("menuId", id);
      fetch(window.location.href, { method: "POST", body: formData }); 
  };

  const toggleExpand = (id: string) => {
      const newSet = new Set(expandedItems);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setExpandedItems(newSet);
  };
  
  const handleDragEnd = (event: DragEndEvent, menuId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = localMenus[menuId];
    
    const findParentId = (list: SiteMenuConfigItem[], id: string): string | null => {
      for (const item of list) {
         if (item.children) {
             if (item.children.some(child => child.id === id)) return item.id;
             const found = findParentId(item.children, id);
             if (found) return found;
         }
      }
      if (list.some(i => i.id === id)) return "root";
      return null;
    };

    const parentId = findParentId(items, active.id as string);
    
    if (parentId) {
        updateMenu(menuId, prev => modifyConfig(prev, parentId, (siblings) => {
            const oldIndex = siblings.findIndex(x => x.id === active.id);
            const newIndex = siblings.findIndex(x => x.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return siblings;
            return arrayMove(siblings, oldIndex, newIndex);
        }));
    }
  };


  // --- Actions ---

  const handleEdit = (item: SiteMenuConfigItem, parentId: string, index: number, contextId: string) => {
    setEditingContext({ item, parentId, index, contextId });
    setIsDialogOpen(true);
  };

  const handleAddChild = (targetParentId: string, contextId: string) => {
    setEditingContext({ item: null, parentId: targetParentId, index: null, contextId });
    setIsDialogOpen(true);
  };

  const handleAddRoot = (contextId: string) => {
    setEditingContext({ item: null, parentId: "root", index: null, contextId });
    setIsDialogOpen(true);
  };
  
  const confirmDelete = (index: number, parentId: string, contextId: string) => {
      setDeleteTarget({ index, parentId, contextId });
  };

  const executeDelete = () => {
      if (!deleteTarget) return;
      const { index, parentId, contextId } = deleteTarget;
      
      updateMenu(contextId, prev => modifyConfig(prev, parentId, (siblings) => {
          const newSiblings = [...siblings];
          newSiblings.splice(index, 1);
          return newSiblings;
      }));
      setDeleteTarget(null);
  };
  
  const handleMove = (index: number, direction: "up" | "down", parentId: string, contextId: string) => {
       updateMenu(contextId, prev => modifyConfig(prev, parentId, (siblings) => {
           const newList = [...siblings];
           if (direction === "up" && index > 0) {
              [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
           } else if (direction === "down" && index < newList.length - 1) {
              [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
           }
           return newList;
       }));
  };

  const handleSaveDialog = (item: SiteMenuConfigItem) => {
      if (!editingContext) return;
      const { parentId, index, contextId } = editingContext;
      
      if (parentId) {
          updateMenu(contextId, prev => modifyConfig(prev, parentId, (siblings) => {
              const newSiblings = [...siblings];
              if (index !== null) {
                  newSiblings[index] = { ...newSiblings[index], ...item };
              } else {
                  newSiblings.push(item);
              }
              return newSiblings;
          }));
      }
      setIsDialogOpen(false);
      setEditingContext(null);
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  // --- Render ---

  return (
    <div className="flex h-full flex-col">
       <div className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">사이트 메뉴 설정</h1>
           <p className="mt-1 text-sm text-gray-500">
             사용자 화면에 표시되는 메뉴를 구성합니다. (Header, Footer 등)
           </p>
        </div>
        <div>
             <button
                onClick={handleCreateMenuLocation}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                메뉴 위치 추가
              </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="grid gap-8">
              {Object.keys(localMenus).map(menuId => (
                  <div key={menuId} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">{menuId}</h2>
                          
                          <div className="flex gap-2">
                              <form method="post" onSubmit={(e) => {
                                  // Manual submit to persist
                                  e.preventDefault();
                                  const formData = new FormData();
                                  formData.append("intent", "save");
                                  formData.append("menuId", menuId);
                                  formData.append("configJson", JSON.stringify(localMenus[menuId]));
                                  fetch(window.location.href, { method: "POST", body: formData })
                                    .then(res => res.json())
                                    .then(data => {
                                        if(data.success) alert("저장되었습니다.");
                                        else alert("저장 실패: " + data.error);
                                    });
                              }}>
                                  <button type="submit" className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                                      저장
                                  </button>
                              </form>
                              <button 
                                  onClick={() => handleAddRoot(menuId)}
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                              >
                                  <Plus className="w-3 h-3"/> 최상위 추가
                              </button>
                          </div>
                      </div>
                      
                      <div className="p-4">
                          <ClientOnly
                            fallback={
                              <div className="p-6 text-center text-sm text-gray-400">
                                메뉴 트리 로딩 중...
                              </div>
                            }
                          >
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(e) => handleDragEnd(e, menuId)}
                            >
                              <RecursiveSortableList
                                items={localMenus[menuId]}
                                parentId="root"
                                contextId={menuId}
                                onDelete={confirmDelete}
                                onAddChild={handleAddChild}
                                onEdit={handleEdit}
                                onMove={handleMove}
                                expandedItems={expandedItems}
                                toggleExpand={toggleExpand}
                              />
                            </DndContext>
                          </ClientOnly>
                          
                          {localMenus[menuId].length === 0 && (
                              <div className="py-8 text-center text-gray-400 text-sm">
                                  메뉴 항목이 없습니다. '최상위 추가' 버튼을 눌러 항목을 추가하세요.
                              </div>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <MenuItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveDialog}
        initialItem={editingContext?.item}
        groupedAvailableMenus={groupedAvailableMenus}
      />

      <DeleteConfirmDialog 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}
