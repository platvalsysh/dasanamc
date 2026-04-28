import { useState, useMemo, useEffect } from "react";
import { clsx } from "clsx";
import { LucideSearch, LucideLoader2, LucideUserPlus, LucideTrash2, LucideMessageSquareText, LucideFileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { AddMemberPanel } from "./AddMemberPanel";
import { GroupMemberExcelDialog } from "./GroupMemberExcelDialog";
import { GroupSmsModal } from "./GroupSmsModal";
import { GroupAlimtalkModal } from "./GroupAlimtalkModal";
import type { GroupMembersLoaderData } from "../../api/groups/members";
import type { GroupListLoaderData } from "../../api/groups/list";
import { ConfirmDialog } from "./ConfirmDialog";
import { AlertDialog } from "./AlertDialog";

interface GroupDetailPanelProps {
    group: GroupListLoaderData['groups'][number];
    options: { major: string, graduate_number: string }[];
    sexOptions: string[];
    onMemberCountChange: (groupId: string, count: number) => void;
    smsTestConfig: { mode: "test", testNumber: string } | { mode: "production" };
}

export function GroupDetailPanel({
    group,
    options,
    sexOptions,
    onMemberCountChange,
    smsTestConfig
}: GroupDetailPanelProps) {
    // -- State --
    // Group details passed via prop
    const [members, setMembers] = useState<GroupMembersLoaderData['members']>([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState("");
    
    // -- UI State --
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [showExcelDialog, setShowExcelDialog] = useState(false);
    const [showSmsModal, setShowSmsModal] = useState(false);
    const [showAlimtalkModal, setShowAlimtalkModal] = useState(false);
    
    // -- Fetchers --
    const [isMembersLoading, setIsMembersLoading] = useState(false);
    
    // -- Dialog States --
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, message: string, onConfirm: () => void }>({ open: false, message: "", onConfirm: () => {} });
    const [alertDialog, setAlertDialog] = useState<{ open: boolean, message: string }>({ open: false, message: "" });

    // -- Bulk Selection --
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // -- Load Members --
    const loadMembers = async () => {
         if (group?.id) {
            setIsMembersLoading(true);
            try {
                const res = await fetch(`/admin/api/bxmember/groups/members?group_id=${group.id}`);
                const data = await res.json() as GroupMembersLoaderData;
                setMembers(data.members);
                setSelectedIds(new Set()); // Reset selection on reload
                onMemberCountChange(group.id, data.members.length);
            } catch (e) {
                console.error("Failed to load members", e);
            } finally {
                setIsMembersLoading(false);
            }
        }
    }

    useEffect(() => {
        loadMembers();
        setMemberSearchQuery("");
        setShowAddPanel(false); // Reset add panel on group change
    }, [group.id]);


    // -- Derived --
    const filteredMembers = useMemo(() => {
        if (!memberSearchQuery) return members;
        const lowerQ = memberSearchQuery.toLowerCase();
        return members.filter(m => {
            return (m.compute_name?.toLowerCase().includes(lowerQ)) || 
                   (m.compute_phone?.includes(lowerQ)) ||
                   (m.compute_email?.toLowerCase().includes(lowerQ));
        });
    }, [members, memberSearchQuery]);

    // -- Handlers --
    const handleDeleteMember = async (id: string, name: string) => {
        setConfirmDialog({
            open: true,
            message: `'${name}' 님을 그룹에서 제외하시겠습니까?`,
            onConfirm: async () => {
                const formData = new FormData();
                formData.append("id", id);
                
                try {
                    const res = await fetch("/admin/api/bxmember/groups/member-remove", {
                        method: "POST",
                        body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                        loadMembers();
                    } else {
                        setAlertDialog({ open: true, message: data.error || "멤버 제외 실패" });
                    }
                } catch (e) {
                    console.error(e);
                    setAlertDialog({ open: true, message: "오류가 발생했습니다." });
                }
            }
        });
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        
        setConfirmDialog({
            open: true,
            message: `선택한 ${selectedIds.size}명의 회원을 그룹에서 제외하시겠습니까?`,
            onConfirm: async () => {
                const formData = new FormData();
                formData.append("ids", JSON.stringify(Array.from(selectedIds)));

                try {
                    const res = await fetch("/admin/api/bxmember/groups/member-remove-bulk", {
                        method: "POST",
                        body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                        loadMembers(); // This will also reset selection
                    } else {
                        setAlertDialog({ open: true, message: data.error || "일괄 삭제 실패" });
                    }
                } catch (e) {
                    console.error(e);
                    setAlertDialog({ open: true, message: "오류가 발생했습니다." });
                }
            }
        });
    };

    const toggleSelectAll = () => {
        if (filteredMembers.length === 0) return;
        if (selectedIds.size === filteredMembers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredMembers.map(m => m.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleReloadMembers = () => {
        if (group?.id) {
            loadMembers();
        }
    };

    return (
        <div className="flex-1 flex h-full overflow-hidden bg-white min-w-0">
            {/* Middle: Member List & Detail */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-6 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 truncate max-w-md">{group.name}</h1>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {(() => {
                                    try {
                                        const ev = group.extra_vars as any;
                                        if (typeof ev === 'string') return JSON.parse(ev).memo;
                                        return ev?.memo;
                                    } catch { return null; }
                                })() || ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium mr-2">
                                총 <span className="text-blue-600 font-bold">{members.length}</span>명
                            </div>

                            {members.length > 0 && (
                                <button
                                    onClick={() => setShowSmsModal(true)}
                                    className="p-2 rounded-md transition-colors flex items-center gap-1 text-sm font-medium bg-green-600 text-white hover:bg-green-700 mr-1"
                                    title="문자 전송"
                                >
                                    문자 전송
                                </button>
                            )}

                            {members.length > 0 && (
                                <button
                                    onClick={() => setShowAlimtalkModal(true)}
                                    className="p-2 rounded-md transition-colors flex items-center gap-1 text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600 mr-1"
                                    title="알림톡 전송"
                                >
                                    <LucideMessageSquareText size={16} />
                                    알림톡 전송
                                </button>
                            )}
                            
                            {!showAddPanel && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowExcelDialog(true)}
                                        className="p-2 rounded-md transition-colors flex items-center gap-1 text-sm font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                        title="구성원 추가 Excel"
                                    >
                                        <LucideFileSpreadsheet size={16} />
                                        구성원 추가 Excel
                                    </button>
                                    <button
                                        onClick={() => setShowAddPanel(true)}
                                        className="p-2 rounded-md transition-colors flex items-center gap-1 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                                        title="구성원 추가"
                                    >
                                        <LucideUserPlus size={16} />
                                        구성원 추가
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Bulk Action Bar */}
                    {selectedIds.size > 0 && (
                        <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-between">
                            <span className="text-sm text-blue-800 font-medium pl-2">
                                {selectedIds.size}명 선택됨
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded text-sm hover:bg-red-50 flex items-center gap-1"
                            >
                                <LucideTrash2 size={14} />
                                선택 삭제
                            </button>
                        </div>
                    )}
                </div>

                {/* Member Search & List */}
                <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
                        <div className="p-4 border-b border-gray-200 bg-white">
                            <div className="relative">
                            <input
                                type="text"
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                                placeholder="구성원 검색 (이름, 전화번호, 이메일)"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 whitespace-nowrap w-4">
                                            <input 
                                                type="checkbox" 
                                                checked={filteredMembers.length > 0 && selectedIds.size === filteredMembers.length}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 whitespace-nowrap">유형</th>
                                        <th className="px-6 py-3 whitespace-nowrap">이름</th>
                                        <th className="px-6 py-3 whitespace-nowrap">정보</th>
                                        <th className="px-6 py-3 whitespace-nowrap">전화번호</th>
                                        <th className="px-6 py-3 whitespace-nowrap">이메일</th>
                                        <th className="px-6 py-3 whitespace-nowrap">등록일</th>
                                        <th className="px-6 py-3 text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isMembersLoading ? (
                                        <tr><td colSpan={8} className="px-6 py-10 text-center"><LucideLoader2 className="animate-spin inline mr-2"/> 로딩중...</td></tr>
                                    ) : filteredMembers.length === 0 ? (
                                        <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">구성원이 없습니다.</td></tr>
                                    ) : (
                                        filteredMembers.map((m: any) => {
                                            return (
                                            <tr key={m.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedIds.has(m.id)}
                                                        onChange={() => toggleSelect(m.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={clsx(
                                                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                                        m.type === 'MEMBER' && "bg-blue-100 text-blue-700",
                                                        m.type === 'PROFESSOR' && "bg-purple-100 text-purple-700",
                                                        m.type === 'EXECUTIVE' && "bg-green-100 text-green-700",
                                                        m.type === 'DIRECT' && "bg-gray-100 text-gray-700"
                                                    )}>
                                                        {m.type === 'MEMBER' ? '동문' : m.type === 'PROFESSOR' ? '교수' : m.type === 'EXECUTIVE' ? '임원' : '직접'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{m.compute_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                    {m.type === 'MEMBER' && (
                                                        <div className="flex flex-col">
                                                            <span>{m.compute_major || "-"}</span>
                                                            {m.compute_graduate_number && <span>{m.compute_graduate_number}회</span>}
                                                            {m.compute_memo && <span className="text-gray-400 text-[10px] mt-0.5">{m.compute_memo}</span>}
                                                        </div>
                                                    )}
                                                    {m.type === 'PROFESSOR' && (m.compute_memo || "-")}
                                                    {m.type === 'EXECUTIVE' && (
                                                        <div className="flex flex-col">
                                                            <span>{m.group_name || "-"} &gt; {m.position_name || "-"}</span>
                                                            {(m.compute_major || m.compute_graduate_number) && (
                                                                <span className="text-gray-400">
                                                                    {m.compute_major} {m.compute_graduate_number && `${m.compute_graduate_number}기`}
                                                                </span>
                                                            )}
                                                            {m.compute_memo && <span className="text-gray-400 text-[10px] mt-0.5">{m.compute_memo}</span>}
                                                        </div>
                                                    )}
                                                    {m.type === 'DIRECT' && (m.compute_memo || "-")}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">{m.compute_phone || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{m.compute_email || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{format(new Date(m.created_at), "yyyy-MM-dd")}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteMember(m.id, m.compute_name)} 
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded" 
                                                        title="제외"
                                                    >
                                                        <LucideTrash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )})
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Add Panel */}
            {showAddPanel && (
                <AddMemberPanel 
                    groupId={group.id}
                    existingMembers={members}
                    options={options}
                    sexOptions={sexOptions}
                    onReload={handleReloadMembers}
                    onClose={() => setShowAddPanel(false)}
                />
            )}

            <GroupMemberExcelDialog 
                open={showExcelDialog}
                onOpenChange={setShowExcelDialog}
                groupId={group.id}
                onSuccess={handleReloadMembers}
            />
            
            <GroupSmsModal
                open={showSmsModal}
                onOpenChange={setShowSmsModal}
                members={members}
                groupName={group.name}
                smsTestConfig={smsTestConfig}
            />
            <GroupAlimtalkModal
                open={showAlimtalkModal}
                onOpenChange={setShowAlimtalkModal}
                members={members}
                groupName={group.name}
                smsTestConfig={smsTestConfig}
            />

            <ConfirmDialog 
                open={confirmDialog.open} 
                message={confirmDialog.message} 
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            />
            
            <AlertDialog 
                open={alertDialog.open} 
                message={alertDialog.message} 
                onClose={() => setAlertDialog(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
}
