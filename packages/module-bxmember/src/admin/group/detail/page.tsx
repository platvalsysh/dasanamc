import {
  useLoaderData,
  type LoaderFunctionArgs,
  data as response,
} from "react-router";
import {
  LucideSearch,
  LucidePlus,
  LucideLoader2,
  LucideMoreHorizontal,
  LucideTrash2,
  LucideEdit,
  LucideChevronLeft,
} from "lucide-react";
import { prisma } from "@repo/database";
import { useAuthServerContext } from "@repo/auth/server";
import { getSmsTestConfig } from "@repo/module-sms/server";
import { useState, useEffect, useMemo } from "react";
import { clsx } from "clsx";
import { format } from "date-fns";
import {
  Button,
  Input,
} from "@repo/ui-admin";
import { CreateGroupDialog } from "../components/CreateGroupDialog";
import { EditGroupDialog } from "../components/EditGroupDialog";
import { GroupDetailPanel } from "../components/GroupDetailPanel";
import type { GroupListLoaderData } from "../../api/groups/list";
export async function loader({ context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.group.list"])) {
    throw new Response("Permission denied", { status: 403 });
  }

  // 1. Fetch Options (Distinct combinations for linked dropdowns)
  const optionsRaw = await prisma.bxmember.findMany({
    distinct: ["major", "graduate_number"],
    select: { major: true, graduate_number: true },
    where: {
      major: { not: null },
      graduate_number: { not: null },
    },
    orderBy: [
      { graduate_number: "desc" }, // Descending as requested
      { major: "asc" },
    ],
  });

  const options = optionsRaw.map((o) => ({
    major: o.major!,
    graduate_number: o.graduate_number!,
  }));

  const sexOptionsRaw = await prisma.bxmember.findMany({
    distinct: ["sex"],
    select: { sex: true },
    where: { sex: { not: null } }
  });
  const sexOptions = sexOptionsRaw.map(s => s.sex!).filter(s => s !== "");

  const smsTestConfig = getSmsTestConfig();

  return response({
    options,
    sexOptions,
    smsTestConfig
  });
}


// Action removed: handled by dedicated API endpoints

export default function GroupDetailPage() {
  const { options, sexOptions, smsTestConfig } = useLoaderData<typeof loader>();

  // State: Groups List
  const [groups, setGroups] = useState<GroupListLoaderData['groups']>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);

  // State: Selected Group
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Dialogs
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupListLoaderData['groups'][number] | null>(null);

  // -- 1. Group List Logic --
  // ... (Same Fetch Groups logic) ...

  const fetchGroups = async (params: URLSearchParams, append: boolean = false) => {
      setIsGroupsLoading(true);
      try {
          const res = await fetch(`/admin/api/bxmember/groups/list?${params.toString()}`);
          const data = await res.json() as GroupListLoaderData;
          setGroups(prev => append ? [...prev, ...data.groups] : data.groups);
          setNextCursor(data.nextCursor);
      } catch (e) {
          console.error("Failed to fetch groups", e);
      } finally {
          setIsGroupsLoading(false);
      }
  };

  const reloadGroups = () => {
    const params = new URLSearchParams();
    if (groupSearchQuery) params.set("q", groupSearchQuery);
    params.set("limit", "20");
    fetchGroups(params, false);
  };

  // Initial Load
  useEffect(() => {
      reloadGroups();
  }, []); 

  const handleSearchGroups = (query: string) => {
    //   setGroupSearchQuery(query); // This is updated via input onChange now
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("limit", "20");
      fetchGroups(params, false);
      setSelectedGroupId(null);
  };

  const handleLoadMoreGroups = () => {
      if (!nextCursor || isGroupsLoading) return;
      const params = new URLSearchParams();
      params.set("cursor", nextCursor);
      if (groupSearchQuery) params.set("q", groupSearchQuery);
      params.set("limit", "20");
      fetchGroups(params, true);
  };

  const executeDeleteGroup = async (id: string, name: string) => {
      if (confirm(`'${name}' 그룹을 삭제하시겠습니까?`)) {
          const formData = new FormData();
          formData.append("id", id);
          
          try {
              const res = await fetch("/admin/api/bxmember/groups/delete", {
                  method: "POST",
                  body: formData
              });
              const data = await res.json();
              if (data.success) {
                //   onGroupDelete(id); // Handled locally
                  setGroups(prev => prev.filter(g => g.id !== id));
                  if (selectedGroupId === id) setSelectedGroupId(null);
              } else {
                  alert(data.error || "그룹 삭제 실패");
              }
          } catch (e) {
              console.error(e);
              alert("오류가 발생했습니다.");
          }
      }
  }

  // Callbacks from Dialogs & Panels
  const handleCreateGroup = (newGroup: GroupListLoaderData['groups'][number]) => {
      setGroups(prev => [newGroup, ...prev]);
      setCreateGroupOpen(false); // Close dialog after successful creation
      setSelectedGroupId(newGroup.id);
  };

  const handleGroupUpdate = (updatedGroup: GroupListLoaderData['groups'][number]) => {
      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };
  
  // Note: handleGroupDelete is removed from props as it is now local

  const handleMemberCountChange = (groupId: string, count: number) => {
      setGroups(prev => prev.map(g => {
         if (g.id === groupId) {
             return { ...g, _count: { bxmember_group_members: count } };
         }
         return g;
      }));
  };

  const selectedGroup = useMemo(() => groups.find(g => g.id === selectedGroupId), [groups, selectedGroupId]);

  // -- Sidebar Event Handlers --
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
        handleSearchGroups(groupSearchQuery);
    }
  };

  return (
    <div className="-m-6 mt-0 flex h-[calc(100vh-64px)] overflow-hidden border-t border-gray-200 bg-gray-50">
      {/* Group List Sidebar (Inlined) */}
      <div 
        className={clsx(
          "z-20 flex w-full md:w-80 shrink-0 flex-col border-r border-gray-200 bg-white",
          selectedGroupId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900">그룹 목록</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCreateGroupOpen(true)}
            title="그룹 추가"
            className="text-gray-600 h-8 w-8"
          >
            <LucidePlus size={16} />
          </Button>
        </div>
        <div className="border-b border-gray-100 p-2">
          <div className="relative flex items-center gap-1">
            <div className="relative flex-1">
                <Input
                  className="pr-10 pl-8 h-9"
                  placeholder="그룹 검색..."
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <LucideSearch
                  className="absolute top-2.5 left-2.5 text-gray-400"
                  size={16}
                />
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSearchGroups(groupSearchQuery)}
                className="text-gray-600 h-9 w-9"
                title="검색"
            >
                <LucideSearch size={16} />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {groups.length === 0 && !isGroupsLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              {groupSearchQuery ? "검색 결과가 없습니다." : "그룹이 없습니다."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {groups.map((g) => (
                <li key={g.id} className="relative group">
                  <button
                    onClick={() => setSelectedGroupId(g.id)}
                    className={clsx(
                      "block w-full border-l-4 p-4 text-left transition-colors hover:bg-gray-50",
                      selectedGroupId === g.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-transparent",
                    )}
                  >
                    <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-gray-900 truncate pr-16 py-0.5">
                        {g.name}
                        </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {g.created_at && format(g.created_at, "yyyy-MM-dd")}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {g._count?.bxmember_group_members ?? 0}명
                      </span>
                    </div>
                  </button>
                  {/* Action Buttons - Absolute positioned, visible on hover */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 px-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingGroup(g);
                        }}
                        className="h-7 w-7 text-gray-400 hover:text-blue-600"
                        title="그룹 수정"
                    >
                        <LucideEdit size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            executeDeleteGroup(g.id, g.name);
                        }}
                        className="h-7 w-7 text-gray-400 hover:text-red-600"
                        title="그룹 삭제"
                    >
                        <LucideTrash2 size={14} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {/* Initial Loading State when empty */}
          {groups.length === 0 && isGroupsLoading && (
            <div className="p-8 text-center">
              <LucideLoader2 className="inline animate-spin text-gray-400" />
            </div>
          )}

          {!!nextCursor && (
            <div className="border-t border-gray-100 p-4">
              <Button
                variant="ghost"
                onClick={handleLoadMoreGroups}
                disabled={isGroupsLoading}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 py-2 h-auto"
              >
                {isGroupsLoading ? (
                  <LucideLoader2 className="animate-spin" size={16} />
                ) : (
                  <LucideMoreHorizontal size={16} />
                )}
                <span>더 보기</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={clsx("flex-1 flex flex-col min-w-0", !selectedGroupId && "hidden md:flex")}>
        {selectedGroup ? (
          <div className="flex flex-col h-full">
             <div className="md:hidden p-4 border-b border-gray-200 bg-white flex items-center gap-2">
                <Button 
                  variant="link"
                  onClick={() => setSelectedGroupId(null)}
                  className="flex items-center text-gray-600 hover:text-gray-900 px-0"
                >
                  <LucideChevronLeft className="w-5 h-5 mr-1" />
                  목록으로
                </Button>
             </div>
             <GroupDetailPanel
                group={selectedGroup}
                options={options}
                sexOptions={sexOptions}
                onMemberCountChange={handleMemberCountChange}
                smsTestConfig={smsTestConfig}
             />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 text-gray-500">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-white border border-gray-100">
                  <LucideSearch className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                  그룹을 선택해주세요
              </h3>
              <p className="mt-2 max-w-xs text-center text-sm">
                  좌측 목록에서 관리할 그룹을 선택해주세요.
              </p>
          </div>
        )}
      </div>

      <CreateGroupDialog 
          open={createGroupOpen} 
          onOpenChange={setCreateGroupOpen}
          onSuccess={handleCreateGroup}
      />
      
      <EditGroupDialog 
        open={!!editingGroup}
        onOpenChange={(open) => !open && setEditingGroup(null)}
        group={editingGroup}
        onSuccess={handleGroupUpdate}
      />
    </div>
  );
}
