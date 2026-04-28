import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Label,
    Textarea,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@repo/ui-admin";
import { Loader2 } from "lucide-react";
import { PositionTransferList } from "./PositionTransferList";
import type { OrganizationLoaderData } from "../organization";

type OrganizationData = Extract<OrganizationLoaderData, { mode: "data" }>;


// Define types for valid/invalid members
type Member = OrganizationData["members"][number];
type ValidMember = Member & { bxmember: NonNullable<Member["bxmember"]> & { cellphone_number: string } };
interface InvalidMember {
    id: string;
    groupName: string;
    positionName: string;
    name: string;
    reason: string;
}

interface OrganizationGroupSmsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groups: OrganizationData["groups"];
    members: OrganizationData["members"];
    smsTestConfig: { mode: "test", testNumber: string } | { mode: "production" };
}

export function OrganizationGroupSmsModal({ open, onOpenChange, groups, members, smsTestConfig }: OrganizationGroupSmsModalProps) {
    const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    
    // Confim & Result Dialog States
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [resultDialog, setResultDialog] = useState<{open: boolean, title: string, message: string} | null>(null);

    // Derived state for positions
    const positionOptions = groups.flatMap((g) => 
        g.organization_positions.map((p) => ({
            id: p.id,
            label: `${g.name} > ${p.name}`
        }))
    );

    // Filter members based on selected positions
    const targetMembers = members.filter(m => selectedPositionIds.includes(m.position_id));
    
    const isValidPhoneNumber = (phone?: string | null) => {
        const p = phone?.replace(/[^0-9]/g, "");
        return !!(p && p.length >= 10 && p.startsWith("01"));
    };

    const getInvalidReason = (m: OrganizationData["members"][number]) => {
        if (!m.bxmember) return "ID 미연동";
        if (!m.bxmember.cellphone_number) return "번호 없음";
        if (!isValidPhoneNumber(m.bxmember.cellphone_number)) return "형식 오류 (010/011...)";
        return "기타 사유";
    };


    const validMembers: ValidMember[] = [];
    const invalidMembers: InvalidMember[] = [];

    for (const m of targetMembers) {
        if (isValidPhoneNumber(m.bxmember?.cellphone_number)) {
            // Type assertion is safe here because of the check
            validMembers.push({
                ...m,
                bxmember: {
                    ...m.bxmember!,
                    cellphone_number: m.bxmember!.cellphone_number!
                }
            });
        } else {
            invalidMembers.push({
                id: m.id,
                groupName: m.organization_groups?.name ?? "",
                positionName: m.organization_positions?.name ?? "",
                name: m.name,
                reason: getInvalidReason(m)
            });
        }
    }

    useEffect(() => {
        if (open) {
            setSelectedPositionIds([]);
            setMessage("");
            setResultDialog(null);
            setConfirmOpen(false);
        }
    }, [open]);

    const handleSendClick = () => {
        setConfirmOpen(true);
    };

    const executeSend = async () => {
        setConfirmOpen(false);
        setSending(true);

        const recipients = validMembers.map(m => ({
            phone: m.bxmember.cellphone_number,
            name: m.name
        }));

        const formData = new FormData();
        formData.append("recipients", JSON.stringify(recipients));
        formData.append("text", message);

        try {
            const res = await fetch("/admin/api/organization/send-sms", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setResultDialog({
                    open: true,
                    title: "발송 성공",
                    message: `${data.sentCount}건 전송 완료`
                });
                setMessage("");
                setSelectedPositionIds([]);
            } else {
                setResultDialog({
                    open: true,
                    title: "발송 실패",
                    message: data.error || "알 수 없는 오류가 발생했습니다."
                });
            }
        } catch (e) {
            console.error(e);
            setResultDialog({
                open: true,
                title: "오류 발생",
                message: "전송 중 오류가 발생했습니다."
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw]">
                <DialogHeader>
                    <DialogTitle>직책별 그룹 문자 전송</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
                    {/* Left: Input Selection */}
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

                        <div className="space-y-2">
                            <Label>메시지 내용</Label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="메시지를 입력하세요 (90바이트 초과 시 LMS로 발송)"
                                className="h-32"
                            />
                            <p className="text-xs text-gray-500 text-right">
                                {new TextEncoder().encode(message).length} Bytes
                            </p>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="border p-4 bg-gray-50 flex flex-col h-full shadow-none">
                        <Tabs defaultValue="valid" className="flex flex-col h-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="valid">발송 대상 ({validMembers.length})</TabsTrigger>
                                <TabsTrigger value="invalid">제외 대상 ({invalidMembers.length})</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="valid" className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px] bg-white border p-2 mt-2">
                                {validMembers.length > 0 ? (
                                    <ul className="text-sm space-y-1">
                                        {validMembers.map((m: any) => (
                                            <li key={m.id} className="flex justify-between border-b pb-1 last:border-0">
                                                <span>
                                                    <span className="font-semibold text-gray-700">{m.organization_groups?.name}</span>
                                                    <span className="text-gray-400 mx-1">&gt;</span>
                                                    {m.organization_positions?.name} - {m.name} 
                                                    <span className="text-gray-400 text-xs ml-1">
                                                        ({m.gisu ? `${m.gisu}기` : '기수미상'})
                                                    </span>
                                                </span>
                                                <span className="text-gray-500">{m.bxmember?.cellphone_number}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-center py-10">발송 가능한 대상이 없습니다.</p>
                                )}
                            </TabsContent>

                            <TabsContent value="invalid" className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px] bg-white border p-2 mt-2">
                                {invalidMembers.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="text-xs text-red-500 bg-red-50 p-2 mb-2">
                                            ⚠️ 연락처 미등록 또는 동문회원 ID 미연동 회원은 발송에서 제외됩니다.
                                        </div>
                                        <ul className="text-sm space-y-1">
                                            {invalidMembers.map((item) => (
                                                <li key={`inv-${item.id}`} className="flex justify-between border-b pb-1 last:border-0 text-gray-500">
                                                    <span>
                                                        <span className="font-medium">{item.groupName}</span>
                                                        <span className="mx-1">&gt;</span>
                                                        {item.positionName} - {item.name}
                                                    </span>
                                                    <span className="text-red-400 text-xs">
                                                        {item.reason}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-10">제외된 대상이 없습니다.</p>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="mt-4 pt-4 border-t space-y-2 bg-white p-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span>총 발송 대상 (유효):</span>
                                <span className="text-blue-600">{validMembers.length}명</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                    <Button 
                        onClick={handleSendClick} 
                        disabled={sending || !message || validMembers.length === 0}
                    >
                        {sending ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
                        전송하기
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Confirmation Dialog (Modal on Modal) */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>발송 확인</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>총 <strong>{validMembers.length}명</strong>에게 메시지를 전송하시겠습니까?</p>
                        {smsTestConfig.mode === "test" && (
                            <p className="text-sm text-orange-600 mt-2">
                                ※ 테스트 모드: <strong>{smsTestConfig.testNumber}</strong>로만 발송됩니다.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>취소</Button>
                        <Button onClick={executeSend} disabled={sending}>
                            {sending ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
                            확인
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Result Dialog */}
            {resultDialog && (
                <Dialog open={resultDialog.open} onOpenChange={() => setResultDialog(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{resultDialog.title}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>{resultDialog.message}</p>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setResultDialog(null)}>확인</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    );
}
