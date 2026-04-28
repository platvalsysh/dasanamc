import { useState, useMemo, useEffect } from "react";
import { LucideSearch, LucidePlus, LucideLoader2, LucideCheck } from "lucide-react";
import { clsx } from "clsx";
import type { GroupExecutiveSearchLoaderData } from "../../api/groups/search/executive";
import { AlertDialog } from "./AlertDialog";

interface ExecutiveSearchTabProps {
    groupId: string;
    existingMembers: any[];
    onReload: () => void;
}

export function ExecutiveSearchTab({ groupId, existingMembers, onReload }: ExecutiveSearchTabProps) {
    const [execQuery, setExecQuery] = useState("");
    const [allExecutives, setAllExecutives] = useState<GroupExecutiveSearchLoaderData['results']>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [alertDialog, setAlertDialog] = useState<{ open: boolean, message: string }>({ open: false, message: "" });
    
    // -- Bulk Selection --
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (allExecutives.length === 0) {
            setIsLoading(true);
            fetch("/admin/api/bxmember/groups/search/executive")
                .then(res => res.json())
                .then(data => {
                    if (data.results) {
                        setAllExecutives(data.results);
                        setSelectedIds(new Set());
                    }
                })
                .catch(e => console.error(e))
                .finally(() => setIsLoading(false));
        }
    }, [allExecutives.length]);

    const filteredExecutives = useMemo(() => {
        if (!execQuery) return allExecutives;
        const q = execQuery.toLowerCase();
        return allExecutives.filter(p => 
            p.name?.toLowerCase().includes(q) ||
            p.group_name?.toLowerCase().includes(q) ||
            p.position_name?.toLowerCase().includes(q) ||
            p.major?.toLowerCase().includes(q) ||
            p.cellphone_number?.includes(q) ||
            p.email?.toLowerCase().includes(q) ||
            p.gisu?.toString().includes(q)
        );
    }, [allExecutives, execQuery]);

    const handleAdd = async (exec: GroupExecutiveSearchLoaderData['results'][number]) => {
        setIsAdding(true);
        const formData = new FormData();
        formData.append("group_id", groupId);
        formData.append("type", "EXECUTIVE");
        formData.append("target_id", exec.id);
        formData.append("ref_data", JSON.stringify({
            seq: exec.id,
            name: exec.name,
            cellphone_number: exec.cellphone_number,
            email: exec.email,
            group_name: exec.group_name,
            position_name: exec.position_name,
            major: exec.major,
            gisu: exec.gisu
        }));

        try {
            const res = await fetch("/admin/api/bxmember/groups/member-add", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                onReload();
            } else {
                setAlertDialog({ open: true, message: data.error || "실패했습니다." });
            }
        } catch (e) {
            console.error(e);
            setAlertDialog({ open: true, message: "오류가 발생했습니다." });
        } finally {
            setIsAdding(false);
        }
    };
    
    const handleBulkAdd = async () => {
        if (!filteredExecutives || selectedIds.size === 0) return;

        // Filter out already added - assuming existing members might use target_id for executives, but let's check how they are stored.
        // I will use ref_data.seq or target_id ? For now, filtering might be tricky if we don't know the exact `em.executive_id` or similar property. 
        // We will assume `em.target_id` or `em.type === 'EXECUTIVE'` can be checked. In `ProfessorSearchTab`, it was `em.professor_id`. 
        // The API `member-add-bulk` accepts `target_id`. `AddMemberPanel` passes `existingMembers`.
        const idsToAdd = Array.from(selectedIds).filter(id => !existingMembers.some(em => em.type === 'EXECUTIVE' && (String(em.target_id) === String(id) || String(em.executive_id) === String(id) || String(em.ref_data?.seq) === String(id))));
        
        if (idsToAdd.length === 0) return;

        const membersToAdd = filteredExecutives
            .filter(p => idsToAdd.includes(p.id))
            .map(exec => ({
                group_id: groupId,
                type: "EXECUTIVE",
                target_id: exec.id,
                snapshot_name: exec.name || "",
                snapshot_phone: exec.cellphone_number || "",
                snapshot_email: exec.email || "",
                ref_data: {
                    seq: exec.id,
                    name: exec.name,
                    cellphone_number: exec.cellphone_number,
                    email: exec.email,
                    group_name: exec.group_name,
                    position_name: exec.position_name,
                    major: exec.major,
                    gisu: exec.gisu
                }
            }));

        setIsAdding(true);
        const formData = new FormData();
        formData.append("members", JSON.stringify(membersToAdd));

        try {
            const res = await fetch("/admin/api/bxmember/groups/member-add-bulk", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                onReload();
                setSelectedIds(new Set());
            } else {
                setAlertDialog({ open: true, message: data.error || "일괄 추가 실패" });
            }
        } catch (e) {
            console.error(e);
            setAlertDialog({ open: true, message: "오류가 발생했습니다." });
        } finally {
            setIsAdding(false);
        }
    };

    const toggleSelectAll = () => {
        if (!filteredExecutives || filteredExecutives.length === 0) return;
        const selectable = filteredExecutives.filter(p => !existingMembers.some(em => em.type === 'EXECUTIVE' && (String(em.target_id) === String(p.id) || String(em.executive_id) === String(p.id) || String(em.ref_data?.seq) === String(p.id))));
        const selectableIds = selectable.map(p => p.id);
        const allSelected = selectableIds.length > 0 && selectableIds.every(id => selectedIds.has(id));

        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(selectableIds));
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

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="relative">
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded pl-8 pr-2 py-1.5 text-sm"
                        placeholder="이름, 그룹명, 직책, 전공, 기수, 연락처 검색..."
                        value={execQuery}
                        onChange={e => setExecQuery(e.target.value)}
                    />
                    <LucideSearch className="absolute left-2.5 top-2 text-gray-400" size={14} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {isLoading && allExecutives.length === 0 ? (
                    <div className="flex justify-center py-8"><LucideLoader2 className="animate-spin text-gray-400" /></div>
                ) : (
                    <div className="space-y-2">
                        {filteredExecutives.length > 0 && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 mb-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        onChange={toggleSelectAll}
                                        checked={
                                            filteredExecutives.length > 0 && 
                                            filteredExecutives.filter(p => !existingMembers.some(em => em.type === 'EXECUTIVE' && (String(em.target_id) === String(p.id) || String(em.executive_id) === String(p.id) || String(em.ref_data?.seq) === String(p.id)))).length > 0 &&
                                            filteredExecutives.filter(p => !existingMembers.some(em => em.type === 'EXECUTIVE' && (String(em.target_id) === String(p.id) || String(em.executive_id) === String(p.id) || String(em.ref_data?.seq) === String(p.id)))).every(p => selectedIds.has(p.id))
                                        }
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-gray-600 font-medium">전체 선택</span>
                                </div>
                                {selectedIds.size > 0 && (
                                    <button
                                        onClick={handleBulkAdd}
                                        disabled={isAdding}
                                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {isAdding ? <LucideLoader2 className="animate-spin" size={12} /> : <LucidePlus size={12} />}
                                        {selectedIds.size}명 추가
                                    </button>
                                )}
                            </div>
                        )}
                        <ul className="space-y-2">
                        {filteredExecutives.map(exec => {
                            const isAdded = existingMembers.some(em => em.type === 'EXECUTIVE' && (String(em.target_id) === String(exec.id) || String(em.executive_id) === String(exec.id) || String(em.ref_data?.seq) === String(exec.id)));
                            return (
                                <li key={exec.id} className="flex flex-col p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-green-200 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(exec.id)}
                                                onChange={() => toggleSelect(exec.id)}
                                                disabled={isAdded}
                                                className="mt-1.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                                    {exec.name}
                                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {exec.group_name} &gt; {exec.position_name}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                    <div>{exec.cellphone_number || exec.email || "연락처 없음"}</div>
                                                    {(exec.major || exec.gisu) && (
                                                        <div className="text-gray-400">
                                                            {exec.major} {exec.gisu && `${exec.gisu}기`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAdd(exec)}
                                            disabled={isAdded || isAdding}
                                            className={clsx(
                                                "p-1.5 rounded-md transition-colors",
                                                isAdded 
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                            )}
                                        >
                                            {isAdded ? <LucideCheck size={16} /> : <LucidePlus size={16} />}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    </div>
                )}
                {filteredExecutives.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 text-sm py-8">임원 검색 결과가 없습니다.</div>
                )}
            </div>
            <AlertDialog 
                open={alertDialog.open} 
                message={alertDialog.message} 
                onClose={() => setAlertDialog(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
}
