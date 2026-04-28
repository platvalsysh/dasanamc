import { useState, useMemo } from "react";
import { LucidePlus, LucideLoader2, LucideCheck } from "lucide-react";
import { clsx } from "clsx";
import type { GroupMemberSearchLoaderData } from "../../api/groups/search/member";
import { AlertDialog } from "./AlertDialog";

interface MemberSearchTabProps {
    groupId: string;
    existingMembers: any[]; // Full member objects
    options: { major: string, graduate_number: string }[];
    sexOptions: string[];
    onReload: () => void;
}


export function MemberSearchTab({ groupId, existingMembers, options, sexOptions, onReload }: MemberSearchTabProps) {
    const [major, setMajor] = useState<string>("all");
    const [gradNum, setGradNum] = useState<string>("all");
    const [sex, setSex] = useState<string>("all");
    const [nameQuery, setNameQuery] = useState("");
    
    const [searchResults, setSearchResults] = useState<GroupMemberSearchLoaderData['results'] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [alertDialog, setAlertDialog] = useState<{ open: boolean, message: string }>({ open: false, message: "" });
    
    // -- Bulk Selection --
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    

    // Derived Options
    const availableGradNums = useMemo(() => {
        let filtered = options;
        if (major !== "all") {
            filtered = options.filter(o => o.major === major);
        }
        const nums = Array.from(new Set(filtered.map(o => o.graduate_number)));
        return nums.sort((a, b) => parseInt(b) - parseInt(a));
    }, [options, major]);

    const availableMajors = useMemo(() => {
        let filtered = options;
        if (gradNum !== "all") {
            filtered = options.filter(o => o.graduate_number === gradNum);
        }
        const majors = Array.from(new Set(filtered.map(o => o.major)));
        return majors.sort();
    }, [options, gradNum]);

    const handleSearch = async () => {
        if (!nameQuery && major === "all" && gradNum === "all" && sex === "all") return;
        const params = new URLSearchParams();
        if (nameQuery) params.set("q", nameQuery);
        if (major !== "all") params.set("major", major);
        if (gradNum !== "all") params.set("graduate_number", gradNum);
        if (sex !== "all") params.set("sex", sex);
        
        setIsSearching(true);
        try {
            const res = await fetch(`/admin/api/bxmember/groups/search/member?${params.toString()}`);
            const data = await res.json();
            setSearchResults(data.results);
            setSelectedIds(new Set());
        } catch(e) {
            console.error(e);
            setAlertDialog({ open: true, message: "검색 중 오류가 발생했습니다." });
        } finally {
            setIsSearching(false);
        }
    };

    const handleAdd = async (member: GroupMemberSearchLoaderData['results'][number]) => {
        setIsAdding(true);
        const formData = new FormData();
        // intent not needed
        formData.append("group_id", groupId);
        formData.append("type", "MEMBER");
        formData.append("target_id", member.id);
        formData.append("ref_data", JSON.stringify({
            seq: member.id.toString(),
            name: member.name,
            major: member.major,
            graduate_number: member.graduate_number,
            cellphone_number: member.cellphone_number,
            email: member.email
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

    // addFetcher effect removed

    const handleBulkAdd = async () => {
        if (!searchResults || selectedIds.size === 0) return;
        
        // Filter out already added members from selection just in case, though UI should prevent it
        const idsToAdd = Array.from(selectedIds).filter(id => !existingMembers.some(em => String(em.member_id) === String(id)));
        
        if (idsToAdd.length === 0) return;

        const membersToAdd = searchResults
            .filter(m => idsToAdd.includes(m.id))
            .map(member => ({
                group_id: groupId,
                type: "MEMBER",
                target_id: member.id,
                snapshot_name: member.name || "",
                snapshot_phone: member.cellphone_number || "",
                snapshot_email: member.email || "",
                ref_data: {
                    seq: member.id.toString(),
                    name: member.name,
                    major: member.major,
                    graduate_number: member.graduate_number,
                    cellphone_number: member.cellphone_number,
                    email: member.email
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
        if (!searchResults || searchResults.length === 0) return;
        
        const selectable = searchResults.filter(m => !existingMembers.some(em => String(em.member_id) === String(m.id)));
        const selectableIds = selectable.map(m => m.id);
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
            <div className="p-4 space-y-3 bg-gray-50 border-b border-gray-200">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">기수</label>
                    <select 
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        value={gradNum}
                        onChange={e => setGradNum(e.target.value)}
                    >
                        <option value="all">전체 기수</option>
                        {availableGradNums.map(n => (
                            <option key={n} value={n}>{n}회</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">전공</label>
                    <select 
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        value={major}
                        onChange={e => setMajor(e.target.value)}
                    >
                        <option value="all">전체 전공</option>
                        {availableMajors.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">이름/성별</label>
                    <div className="flex gap-2">
                        <select 
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-24 shrink-0"
                            value={sex}
                            onChange={e => setSex(e.target.value)}
                        >
                            <option value="all">전체 성별</option>
                            {sexOptions.map(s => (
                                <option key={s} value={s}>{s === 'M' ? '남성' : s === 'F' ? '여성' : s}</option>
                            ))}
                        </select>
                        <input 
                            type="text" 
                            className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
                            placeholder="이름 검색"
                            value={nameQuery}
                            onChange={e => setNameQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSearch()}
                        />
                        <button 
                            onClick={handleSearch}
                            className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 whitespace-nowrap"
                        >
                            검색
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {isSearching ? (
                    <div className="flex justify-center py-8"><LucideLoader2 className="animate-spin text-gray-400" /></div>
                ) : searchResults ? (
                    searchResults.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-8">검색 결과가 없습니다.</div>
                    ) : (
                        <div className="space-y-2">
                            {/* Bulk Action Bar */}
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 mb-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        onChange={toggleSelectAll}
                                        checked={
                                            searchResults.length > 0 && 
                                            searchResults.filter(m => !existingMembers.some(em => String(em.member_id) === String(m.id))).length > 0 &&
                                            searchResults.filter(m => !existingMembers.some(em => String(em.member_id) === String(m.id))).every(m => selectedIds.has(m.id))
                                        }
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-gray-600 font-medium">전체 선택</span>
                                </div>
                                {selectedIds.size > 0 && (
                                    <button
                                        onClick={handleBulkAdd}
                                        disabled={isAdding}
                                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {isAdding ? <LucideLoader2 className="animate-spin" size={12} /> : <LucidePlus size={12} />}
                                        {selectedIds.size}명 추가
                                    </button>
                                )}
                            </div>

                            <ul className="space-y-2">
                            {searchResults.map(member => {
                                // Check duplications using existingMembers array
                                const isAdded = existingMembers.some(em => em.type === 'MEMBER' && String(em.member_id) === String(member.id));
                                return (
                                    <li key={member.key} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(member.id)}
                                                onChange={() => toggleSelect(member.id)}
                                                disabled={isAdded}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">
                                                    {member.name} {member.sex ? `(${member.sex === 'M' ? '남' : member.sex === 'F' ? '여' : member.sex})` : ""}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {member.graduate_number}회 | {member.major}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAdd(member)}
                                            disabled={isAdded || isAdding}
                                            className={clsx(
                                                "p-1.5 rounded-md transition-colors",
                                                isAdded 
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                            )}
                                        >
                                            {isAdded ? <LucideCheck size={16} /> : <LucidePlus size={16} />}
                                        </button>
                                    </li>
                                );
                            })}
                            </ul>
                        </div>
                    )
                ) : (
                    <div className="text-center text-gray-400 text-sm py-8">
                        조건을 선택하고 검색해주세요.
                    </div>
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
