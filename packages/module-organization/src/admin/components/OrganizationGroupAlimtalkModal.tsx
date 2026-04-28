import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@repo/ui-admin";
import { Loader2 } from "lucide-react";
import { PositionTransferList } from "./PositionTransferList";
import type { OrganizationLoaderData } from "../organization";
// Import from module-bxmember
import { AlimtalkTemplateSelector, type AlimtalkTemplate } from "../../../../module-bxmember/src/admin/member/components/AlimtalkTemplateSelector";

type OrganizationData = Extract<OrganizationLoaderData, { mode: "data" }>;
type Member = OrganizationData["members"][number];

interface ValidMember {
    id: string;
    name: string;
    phone: string;
    groupName: string;
    positionName: string;
    gisu?: string;
}

interface InvalidMember {
    id: string;
    name: string;
    groupName: string;
    positionName: string;
    reason: string;
}

interface OrganizationGroupAlimtalkModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groups: OrganizationData["groups"];
    members: OrganizationData["members"];
    smsTestConfig: { mode: "test", testNumber: string } | { mode: "production" };
}

export function OrganizationGroupAlimtalkModal({ open, onOpenChange, groups, members, smsTestConfig }: OrganizationGroupAlimtalkModalProps) {
    const [template, setTemplate] = useState<AlimtalkTemplate | null>(null);
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [variablesExtra, setVariablesExtra] = useState<Record<string, string>>({});
    
    const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);
    const [sending, setSending] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [resultDialog, setResultDialog] = useState<{open: boolean, title: string, message: string} | null>(null);

    // Derived state for positions
    const positionOptions = useMemo(() => groups.flatMap((g) => 
        g.organization_positions.map((p) => ({
            id: p.id,
            label: `${g.name} > ${p.name}`
        }))
    ), [groups]);

    const isValidPhoneNumber = (phone?: string | null) => {
        const p = phone?.replace(/[^0-9]/g, "");
        return !!(p && p.length >= 10 && p.startsWith("01"));
    };

    const getInvalidReason = (m: Member) => {
        if (!m.bxmember) return "ID 미연동";
        if (!m.bxmember.cellphone_number) return "번호 없음";
        if (!isValidPhoneNumber(m.bxmember.cellphone_number)) return "형식 오류";
        return "기타 사유";
    };

    // Calculate Valid/Invalid members based on selection
    const { validMembers, invalidMembers } = useMemo(() => {
        const targetMembers = members.filter(m => selectedPositionIds.includes(m.position_id));
        const valid: ValidMember[] = [];
        const invalid: InvalidMember[] = [];

        for (const m of targetMembers) {
            const phone = m.bxmember?.cellphone_number;
            if (isValidPhoneNumber(phone)) {
                valid.push({
                    id: m.id,
                    name: m.name,
                    phone: phone!,
                    groupName: m.organization_groups?.name ?? "",
                    positionName: m.organization_positions?.name ?? "",
                    gisu: m.gisu ?? undefined
                });
            } else {
                invalid.push({
                    id: m.id,
                    name: m.name,
                    groupName: m.organization_groups?.name ?? "",
                    positionName: m.organization_positions?.name ?? "",
                    reason: getInvalidReason(m)
                });
            }
        }
        return { validMembers: valid, invalidMembers: invalid };
    }, [members, selectedPositionIds]);

    // Initial Reset
    useEffect(() => {
        if (open) {
            setSelectedPositionIds([]);
            setTemplate(null);
            setVariables({});
            setVariablesExtra({});
            setConfirmOpen(false);
        }
    }, [open]);
    
    const executeSend = async () => {
        if (!template) return;
        setConfirmOpen(false); 
        setSending(true);
        
        const recipients = validMembers.map(r => ({ phone: r.phone, name: r.name }));
        const formData = new FormData();
        formData.append("recipients", JSON.stringify(recipients));
        formData.append("templateId", template.templateId);
        formData.append("channelId", template.channelId);
        formData.append("text", template.content);
        formData.append("variables", JSON.stringify(variables));
        formData.append("variablesExtra", JSON.stringify(variablesExtra));

        try {
            // NOTE: Using bxmember API for sending since it's the same logic
            const res = await fetch("/admin/api/bxmember/member/send/kakao", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                setResultDialog({ open: true, title: "발송 성공", message: `${data.sentCount}건 알림톡 전송 완료` });
            } else {
                setResultDialog({ open: true, title: "발송 실패", message: data.error || "오류가 발생했습니다." });
            }
        } catch (e) {
            setResultDialog({ open: true, title: "오류 발생", message: "전송 중 오류가 발생했습니다." });
        } finally { setSending(false); }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw]">
                <DialogHeader><DialogTitle>직책별 그룹 알림톡 전송</DialogTitle></DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
                    <div className="space-y-6">
                        {smsTestConfig.mode === "test" && (
                            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 text-sm">
                                <p className="font-bold mb-1">⚠️ 테스트 모드 활성화</p>
                                <p>모든 발송이 <strong>{smsTestConfig.testNumber}</strong> 번호로 전송됩니다.</p>
                            </div>
                        )}

                        <PositionTransferList 
                            options={positionOptions}
                            selectedIds={selectedPositionIds}
                            onChange={setSelectedPositionIds}
                        />

                        <div className="space-y-4">
                            
                            <AlimtalkTemplateSelector onSelectionChange={(t, v, ve) => {
                                setTemplate(t);
                                setVariables(v);
                                setVariablesExtra(ve);
                            }} />
                        </div>
                    </div>

                    <div className="border p-4 bg-gray-50 flex flex-col h-full shadow-none">
                        <Tabs defaultValue="valid" className="flex flex-col h-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="valid">발송 대상 ({validMembers.length})</TabsTrigger>
                                <TabsTrigger value="invalid">제외 대상 ({invalidMembers.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="valid" className="flex-1 overflow-y-auto min-h-75 max-h-125 bg-white border p-2 mt-2">
                                {validMembers.length > 0 ? (
                                    <ul className="text-sm space-y-1">
                                        {validMembers.map((m) => (
                                            <li key={m.id} className="flex justify-between border-b pb-1 last:border-0 text-gray-600">
                                                <span>
                                                    <span className="font-semibold">{m.groupName}</span>
                                                    <span className="mx-1">&gt;</span>
                                                    {m.positionName} - {m.name} 
                                                    {m.gisu && <span className="text-gray-400 text-xs ml-1">({m.gisu}기)</span>}
                                                </span>
                                                <span className="text-blue-600 ml-2">{m.phone}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-gray-500 text-center py-10">대상 없음</p>}
                            </TabsContent>
                            <TabsContent value="invalid" className="flex-1 overflow-y-auto min-h-75 max-h-125 bg-white border p-2 mt-2">
                                {invalidMembers.length > 0 ? <ul className="text-sm space-y-1">{invalidMembers.map((m) => <li key={m.id} className="flex justify-between border-b pb-1 last:border-0 text-gray-400"><span>{m.groupName} &gt; {m.name}</span><span className="text-red-400 text-xs">{m.reason}</span></li>)}</ul> : <p className="text-gray-500 text-center py-10">제외 없음</p>}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                    <Button onClick={() => setConfirmOpen(true)} disabled={sending || !template || validMembers.length === 0}>전송하기</Button>
                </DialogFooter>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent><DialogHeader><DialogTitle>알림톡 발송 확인</DialogTitle></DialogHeader>
                        <div className="py-2"><p>선택한 직책의 <strong>{validMembers.length}명</strong>에게 알림톡을 전송하시겠습니까?</p></div>
                        <DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>취소</Button><Button onClick={executeSend} disabled={sending}>{sending && <Loader2 className="animate-spin h-4 w-4 mr-2"/>}확인</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

                {resultDialog && (
                    <Dialog open={resultDialog.open} onOpenChange={() => setResultDialog(null)}>
                        <DialogContent><DialogHeader><DialogTitle>{resultDialog.title}</DialogTitle></DialogHeader>
                        <div className="py-2"><p>{resultDialog.message}</p></div>
                        <DialogFooter><Button onClick={() => { setResultDialog(null); if (resultDialog.title === "발송 성공") onOpenChange(false); }}>확인</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </DialogContent>
        </Dialog>
    );
}
