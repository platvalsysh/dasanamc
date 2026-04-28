import { useState, useEffect, useCallback } from "react";
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
import { AlimtalkTemplateSelector, type AlimtalkTemplate } from "./AlimtalkTemplateSelector";

interface SelectedAlimtalkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: { name_kor?: string; cellphone_number?: string }[];
  smsTestConfig: { mode: "test", testNumber: string } | { mode: "production" };
}

interface ValidRecipient {
  name_kor?: string;
  cellphone_number: string;
}

interface InvalidRecipient {
  name_kor?: string;
  cellphone_number?: string;
  reason: string;
}

export function SelectedAlimtalkModal({ open, onOpenChange, recipients, smsTestConfig }: SelectedAlimtalkModalProps) {
  const [template, setTemplate] = useState<AlimtalkTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [variablesExtra, setVariablesExtra] = useState<Record<string, string>>({});
  
  const [sending, setSending] = useState(false);
  const [validRecipients, setValidRecipients] = useState<ValidRecipient[]>([]);
  const [invalidRecipients, setInvalidRecipients] = useState<InvalidRecipient[]>([]);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<{open: boolean, title: string, message: string} | null>(null);

  const isValidPhoneNumber = (phone?: string) => {
    const p = phone?.replace(/[^0-9]/g, "");
    return !!(p && p.length >= 10 && p.startsWith("01"));
  };

  // Reset & Calculate Recipients
  useEffect(() => {
    if (open) {
      setTemplate(null);
      setVariables({});
      setVariablesExtra({});
      setConfirmOpen(false);

      const valid: ValidRecipient[] = [];
      const invalid: InvalidRecipient[] = [];

      for (const r of recipients) {
          if (r.cellphone_number && isValidPhoneNumber(r.cellphone_number)) {
              valid.push({ name_kor: r.name_kor, cellphone_number: r.cellphone_number });
          } else {
              invalid.push({ name_kor: r.name_kor, cellphone_number: r.cellphone_number, reason: r.cellphone_number ? "형식 오류" : "번호 없음" });
          }
      }
      setValidRecipients(valid);
      setInvalidRecipients(invalid);
    }
  }, [open, recipients]);

  const executeSend = async () => {
    if (!template) return;
    setConfirmOpen(false); 
    setSending(true);
    
    const payloadRecipients = validRecipients.map(r => ({ phone: r.cellphone_number, name: r.name_kor }));
    const formData = new FormData();
    formData.append("recipients", JSON.stringify(payloadRecipients));
    formData.append("templateId", template.templateId);
    formData.append("channelId", template.channelId);
    formData.append("text", template.content);
    formData.append("variables", JSON.stringify(variables));
    formData.append("variablesExtra", JSON.stringify(variablesExtra));

    try {
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto w-[95vw]">
        <DialogHeader><DialogTitle>선택 알림톡 전송</DialogTitle></DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="space-y-6">
            {smsTestConfig.mode === "test" && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md text-sm">
                    <p className="font-bold mb-1">⚠️ 테스트 모드 활성화</p>
                    <p>모든 발송이 <strong>{smsTestConfig.testNumber}</strong> 번호로 전송됩니다.</p>
                </div>
            )}
            
            <div className="space-y-4">
              <AlimtalkTemplateSelector onSelectionChange={(t, v, ve) => {
                setTemplate(t);
                setVariables(v);
                setVariablesExtra(ve);
              }} />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 flex flex-col h-full">
            <h3 className="font-semibold mb-2">수신자 목록</h3>
            <Tabs defaultValue="valid" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="valid">발송 대상 ({validRecipients.length})</TabsTrigger>
                    <TabsTrigger value="invalid">제외 대상 ({invalidRecipients.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="valid" className="flex-1 overflow-y-auto min-h-75 max-h-125 bg-white border rounded p-2 mt-2">
                    {validRecipients.length > 0 ? (
                        <ul className="text-sm space-y-1">
                            {validRecipients.map((m, i) => <li key={`valid-${i}`} className="flex justify-between border-b pb-1 last:border-0"><span>{m.name_kor}</span><span className="text-gray-500">{m.cellphone_number}</span></li>)}
                        </ul>
                    ) : <p className="text-gray-500 text-center py-10">대상 없음</p>}
                </TabsContent>
                <TabsContent value="invalid" className="flex-1 overflow-y-auto min-h-75 max-h-125 bg-white border rounded p-2 mt-2">
                    {invalidRecipients.length > 0 ? <ul className="text-sm space-y-1">{invalidRecipients.map((m, i) => <li key={`inv-${i}`} className="flex justify-between border-b pb-1 last:border-0 text-gray-400"><span>{m.name_kor}</span><span>{m.reason}</span></li>)}</ul> : <p className="text-gray-500 text-center py-10">제외 없음</p>}
                </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={() => setConfirmOpen(true)} disabled={sending || !template || validRecipients.length === 0}>전송하기</Button>
        </DialogFooter>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent><DialogHeader><DialogTitle>알림톡 발송 확인</DialogTitle></DialogHeader>
                <div className="py-2"><p>총 <strong>{validRecipients.length}명</strong>에게 알림톡을 전송하시겠습니까?</p></div>
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
