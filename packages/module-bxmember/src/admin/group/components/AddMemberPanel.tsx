import { useState } from "react";
import { LucidePlus, LucideX } from "lucide-react";
import { clsx } from "clsx";
import { MemberSearchTab } from "./MemberSearchTab";
import { ProfessorSearchTab } from "./ProfessorSearchTab";
import { ExecutiveSearchTab } from "./ExecutiveSearchTab";
import { DirectInputTab } from "./DirectInputTab";

interface AddMemberPanelProps {
    groupId: string;
    existingMembers: any[]; // Changed from existingMemberIds Set to full Member array
    options: { major: string, graduate_number: string }[];
    sexOptions: string[];
    onReload: () => void;
    onClose: () => void;
}

export function AddMemberPanel({ groupId, existingMembers, options, sexOptions, onReload, onClose }: AddMemberPanelProps) {
    const [tab, setTab] = useState<"MEMBER" | "PROFESSOR" | "EXECUTIVE" | "DIRECT">("MEMBER");

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-96 shadow-xl z-10">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <LucidePlus size={20} className="text-blue-600" />
                    구성원 추가
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <LucideX size={20} />
                </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setTab("MEMBER")}
                    className={clsx("flex-1 py-3 text-sm font-medium transition-colors", tab === "MEMBER" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700")}
                >
                    동문 검색
                </button>
                <button 
                    onClick={() => setTab("PROFESSOR")}
                    className={clsx("flex-1 py-3 text-sm font-medium transition-colors whitespace-nowrap", tab === "PROFESSOR" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700")}
                >
                    교수진 목록
                </button>
                <button 
                    onClick={() => setTab("EXECUTIVE")}
                    className={clsx("flex-1 py-3 text-sm font-medium transition-colors whitespace-nowrap", tab === "EXECUTIVE" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700")}
                >
                    임원진 목록
                </button>
                <button 
                    onClick={() => setTab("DIRECT")}
                    className={clsx("flex-1 py-3 text-sm font-medium transition-colors whitespace-nowrap", tab === "DIRECT" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700")}
                >
                    직접 입력
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {tab === "MEMBER" ? (
                    <MemberSearchTab 
                        groupId={groupId} 
                        existingMembers={existingMembers} 
                        options={options} 
                        sexOptions={sexOptions}
                        onReload={onReload} 
                    />
                ) : tab === "PROFESSOR" ? (
                    <ProfessorSearchTab 
                        groupId={groupId} 
                        existingMembers={existingMembers} 
                        onReload={onReload} 
                    />
                ) : tab === "EXECUTIVE" ? (
                    <ExecutiveSearchTab 
                        groupId={groupId} 
                        existingMembers={existingMembers} 
                        onReload={onReload} 
                    />
                ) : (
                    <DirectInputTab 
                        groupId={groupId} 
                        onReload={onReload} 
                    />
                )}
            </div>
        </div>
    );
}
