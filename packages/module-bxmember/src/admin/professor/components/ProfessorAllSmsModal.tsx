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

const isValidPhoneNumber = (phone?: string) => {
  const p = phone?.replace(/[^0-9]/g, "");
  return !!(p && p.length >= 10 && p.startsWith("01"));
};

interface ValidRecipient {
  name_kor: string;
  cellphone_number: string;
  seq: number;
}

interface InvalidRecipient {
  name_kor: string;
  cellphone_number?: string;
  reason: string;
  seq: number;
}

interface ProfessorAllSmsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  smsTestConfig: { mode: "test", testNumber: string } | { mode: "production" };
}

export function ProfessorAllSmsModal({ open, onOpenChange, smsTestConfig }: ProfessorAllSmsModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  const [professors, setProfessors] = useState<any[]>([]);
  const [validRecipients, setValidRecipients] = useState<ValidRecipient[]>([]);
  const [invalidRecipients, setInvalidRecipients] = useState<InvalidRecipient[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Confim & Result Dialog States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<{open: boolean, title: string, message: string} | null>(null);

  // Fetch all professors on open
  useEffect(() => {
    if (open) {
      setMessage("");
      setProfessors([]);
      setValidRecipients([]);
      setInvalidRecipients([]);
      setConfirmOpen(false);
      setResultDialog(null);
      fetchPreview();
    }
  }, [open]);

  const fetchPreview = async () => {
    setLoadingPreview(true);
    try {
      const res = await fetch("/admin/api/bxmember/professor/all", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const profs = data.data.professors;
        setProfessors(profs);

        const valid: ValidRecipient[] = [];
        const invalid: InvalidRecipient[] = [];

        for (const p of profs) {
          if (isValidPhoneNumber(p.cellphone_number)) {
            valid.push({
              name_kor: p.name_kor,
              cellphone_number: p.cellphone_number!,
              seq: p.seq,
            });
          } else {
            invalid.push({
              name_kor: p.name_kor,
              cellphone_number: p.cellphone_number,
              reason: p.cellphone_number ? "형식 오류" : "번호 없음",
              seq: p.seq,
            });
          }
        }
        setValidRecipients(valid);
        setInvalidRecipients(invalid);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPreview(false);
    }
  };


  const handleSendClick = () => {
    setConfirmOpen(true);
  };

  const executeSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    const recipients = validRecipients.map(p => ({
        phone: p.cellphone_number,
        name: p.name_kor,
    }));

    const formData = new FormData();
    formData.append("recipients", JSON.stringify(recipients));
    formData.append("text", message);

    try {
      const res = await fetch("/admin/api/bxmember/member/send/sms", {
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
          <DialogTitle>전체 교수 문자 전송</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          {/* Left: Message Input */}
          <div className="space-y-6">
            {smsTestConfig.mode === "test" && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md text-sm">
                    <p className="font-bold mb-1">⚠️ 테스트 모드 활성화</p>
                    <p>모든 발송이 <strong>{smsTestConfig.testNumber}</strong> 번호로 전송됩니다.</p>
                </div>
            )}
            <div className="space-y-2">
               <Label>메시지 내용</Label>
               <Textarea
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 placeholder="메시지를 입력하세요 (자동으로 SMS/LMS 전환)"
                 className="h-48"
               />
               <p className="text-xs text-gray-500 text-right">
                 {new TextEncoder().encode(message).length} Bytes
               </p>
            </div>
          </div>

          {/* Right: Preview (All Professors) */}
          <div className="border rounded-lg p-4 bg-gray-50 flex flex-col h-full">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              발송 대상 (전체 교수)
              {loadingPreview && <Loader2 className="animate-spin h-4 w-4" />}
            </h3>
            
            <Tabs defaultValue="valid" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="valid">발송 대상 ({validRecipients.length})</TabsTrigger>
                    <TabsTrigger value="invalid">제외 대상 ({invalidRecipients.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="valid" className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px] bg-white border rounded p-2 mt-2">
                    {validRecipients.length > 0 ? (
                        <ul className="text-sm space-y-1">
                            {validRecipients.map((p, i) => (
                                <li key={`p-${i}-${p.cellphone_number}`} className="flex justify-between border-b pb-1 last:border-0 text-blue-700">
                                    <span>{p.name_kor}</span>
                                    <span className="text-gray-500">{p.cellphone_number}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-10">
                            {loadingPreview ? "로딩 중..." : "발송 가능한 번호가 없습니다."}
                        </p>
                    )}
                </TabsContent>

                <TabsContent value="invalid" className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px] bg-white border rounded p-2 mt-2">
                    {invalidRecipients.length > 0 ? (
                        <div className="space-y-2">
                            <div className="text-xs text-red-500 bg-red-50 p-2 rounded mb-2">
                                ⚠️ 연락처 미등록 교수는 발송에서 제외됩니다.
                            </div>
                            <ul className="text-sm space-y-1">
                                {invalidRecipients.map((p, i) => (
                                    <li key={`inv-${i}-${p.seq}`} className="flex justify-between border-b pb-1 last:border-0 text-gray-500">
                                        <span>{p.name_kor}</span>
                                        <span className="text-red-400 text-xs">{p.cellphone_number}</span>
                                        <span className="text-red-400 text-xs">{p.reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-10">제외된 대상이 없습니다.</p>
                    )}
                </TabsContent>
            </Tabs>
            
            <div className="mt-4 pt-4 border-t flex justify-between items-center bg-white p-2 rounded">
                 <div className="text-sm font-medium">총 발송 대상: {validRecipients.length}명</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSendClick} disabled={sending || !message || validRecipients.length === 0}>
             {sending ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
             전송하기
          </Button>
        </DialogFooter>

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>발송 확인</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>총 <strong>{validRecipients.length}명</strong>(전체 교수)에게 메시지를 전송하시겠습니까?</p>
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
                        <Button onClick={() => {
                            setResultDialog(null);
                            if (resultDialog.title === "발송 성공") {
                                onOpenChange(false);
                            }
                        }}>확인</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
