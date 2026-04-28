import { useState, useMemo, useEffect } from "react";
import { LucideSearch, LucidePlus, LucideLoader2, LucideCheck } from "lucide-react";
import { clsx } from "clsx";
import type { GroupProfessorSearchLoaderData } from "../../api/groups/search/professor";
import { AlertDialog } from "./AlertDialog";

interface ProfessorSearchTabProps {
    groupId: string;
    existingMembers: any[];
    onReload: () => void;
}

export function ProfessorSearchTab({ groupId, existingMembers, onReload }: ProfessorSearchTabProps) {
    const [profQuery, setProfQuery] = useState("");
    const [allProfessors, setAllProfessors] = useState<GroupProfessorSearchLoaderData['results']>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [alertDialog, setAlertDialog] = useState<{ open: boolean, message: string }>({ open: false, message: "" });
    
    // -- Bulk Selection --
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    


    useEffect(() => {
        if (allProfessors.length === 0) {
            setIsLoading(true);
            fetch("/admin/api/bxmember/groups/search/professor")
                .then(res => res.json())
                .then(data => {
                    if (data.results) {
                setAllProfessors(data.results);
                setSelectedIds(new Set());
            }
        })
        .catch(e => console.error(e))
        .finally(() => setIsLoading(false));
        }
    }, [allProfessors.length]);

    const filteredProfessors = useMemo(() => {
        if (!profQuery) return allProfessors;
        return allProfessors.filter(p => p.name?.includes(profQuery));
    }, [allProfessors, profQuery]);

    const handleAdd = async (prof: GroupProfessorSearchLoaderData['results'][number]) => {
        setIsAdding(true);
        const formData = new FormData();
        // intent not needed
        formData.append("group_id", groupId);
        formData.append("type", "PROFESSOR");
        formData.append("target_id", prof.id);
        formData.append("ref_data", JSON.stringify({
            seq: prof.id.toString(),
            name: prof.name,
            cellphone_number: prof.cellphone_number,
            email: prof.email
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
        if (!filteredProfessors || selectedIds.size === 0) return;

        // Filter out already added
        const idsToAdd = Array.from(selectedIds).filter(id => !existingMembers.some(em => String(em.professor_id) === String(id)));
        
        if (idsToAdd.length === 0) return;

        const membersToAdd = filteredProfessors
            .filter(p => idsToAdd.includes(p.id))
            .map(prof => ({
                group_id: groupId,
                type: "PROFESSOR",
                target_id: prof.id,
                snapshot_name: prof.name || "",
                snapshot_phone: prof.cellphone_number || "",
                snapshot_email: prof.email || "",
                ref_data: {
                    seq: prof.id.toString(),
                    name: prof.name,
                    cellphone_number: prof.cellphone_number,
                    email: prof.email
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
        if (!filteredProfessors || filteredProfessors.length === 0) return;
        
        const selectable = filteredProfessors.filter(p => !existingMembers.some(em => String(em.professor_id) === String(p.id)));
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

    // addFetcher effect removed

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="relative">
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded pl-8 pr-2 py-1.5 text-sm"
                        placeholder="교수명 검색..."
                        value={profQuery}
                        onChange={e => setProfQuery(e.target.value)}
                    />
                    <LucideSearch className="absolute left-2.5 top-2 text-gray-400" size={14} />
                    </div>
            </div>

                <div className="flex-1 overflow-y-auto p-4">
                {isLoading && allProfessors.length === 0 ? (
                    <div className="flex justify-center py-8"><LucideLoader2 className="animate-spin text-gray-400" /></div>
                ) : (
                    <div className="space-y-2">
                        {filteredProfessors.length > 0 && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 mb-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        onChange={toggleSelectAll}
                                        checked={
                                            filteredProfessors.length > 0 && 
                                            filteredProfessors.filter(p => !existingMembers.some(em => String(em.professor_id) === String(p.id))).length > 0 &&
                                            filteredProfessors.filter(p => !existingMembers.some(em => String(em.professor_id) === String(p.id))).every(p => selectedIds.has(p.id))
                                        }
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-gray-600 font-medium">전체 선택</span>
                                </div>
                                {selectedIds.size > 0 && (
                                    <button
                                        onClick={handleBulkAdd}
                                        disabled={isAdding}
                                        className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {isAdding ? <LucideLoader2 className="animate-spin" size={12} /> : <LucidePlus size={12} />}
                                        {selectedIds.size}명 추가
                                    </button>
                                )}
                            </div>
                        )}
                        <ul className="space-y-2">
                        {filteredProfessors.map(prof => {
                            const isAdded = existingMembers.some(em => em.type === 'PROFESSOR' && String(em.professor_id) === String(prof.id));
                            return (
                                <li key={prof.key} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-purple-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.has(prof.id)}
                                            onChange={() => toggleSelect(prof.id)}
                                            disabled={isAdded}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">{prof.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {prof.cellphone_number || prof.email || "연락처 없음"}
                                        </div>
                                    </div>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(prof)}
                                        disabled={isAdded || isAdding}
                                        className={clsx(
                                            "p-1.5 rounded-md transition-colors",
                                            isAdded 
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                        )}
                                    >
                                        {isAdded ? <LucideCheck size={16} /> : <LucidePlus size={16} />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    </div>
                )}
                {filteredProfessors.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 text-sm py-8">교수진 검색 결과가 없습니다.</div>
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
