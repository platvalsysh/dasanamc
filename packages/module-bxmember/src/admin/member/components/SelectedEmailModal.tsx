import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  Input,
  Textarea,
} from "@repo/ui-admin";
import { Loader2 } from "lucide-react";

interface ValidRecipient {
  name_kor: string;
  email: string;
}

interface InvalidRecipient {
  name_kor: string;
  email?: string;
  reason: string;
}

interface SelectedEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: { name_kor?: string; email?: string }[];
}

export function SelectedEmailModal({ open, onOpenChange, recipients }: SelectedEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [validRecipients, setValidRecipients] = useState<ValidRecipient[]>([]);
  const [invalidRecipients, setInvalidRecipients] = useState<InvalidRecipient[]>([]);

  useEffect(() => {
    if (open) {
      setSubject("");
      setHtml("");
      
      const valid: ValidRecipient[] = [];
      const invalid: InvalidRecipient[] = [];

      for (const r of recipients) {
        if (r.email && r.email.trim() !== "") {
          valid.push({
            name_kor: r.name_kor || "이름 없음",
            email: r.email,
          });
        } else {
          invalid.push({
            name_kor: r.name_kor || "이름 없음",
            email: r.email,
            reason: "이메일 없음",
          });
        }
      }
      setValidRecipients(valid);
      setInvalidRecipients(invalid);
    }
  }, [open, recipients]);

  const handleSend = async () => {
    if (!confirm(`총 ${validRecipients.length}명에게 이메일을 전송하시겠습니까?`)) return;

    setSending(true);
    
    const formData = new FormData();
    // Use recipients list for flexibility (supports Professors)
    formData.append("recipients", JSON.stringify(validRecipients.map(r => ({
        email: r.email,
        name: r.name_kor,
    }))));
    formData.append("subject", subject);
    formData.append("html", html);

    try {
      const res = await fetch("/admin/api/bxmember/member/send/email", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.sentCount}건 전송 완료`);
        onOpenChange(false);
      } else {
        alert(`전송 실패: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("전송 중 오류 발생");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>선택 이메일 전송</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left: Input Selection */}
          <div className="space-y-6">
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label>제목</Label>
                    <Input 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="이메일 제목"
                    />
                </div>
                <div className="space-y-2">
                    <Label>내용 (HTML 지원)</Label>
                    <Textarea
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      placeholder="<p>이메일 내용을 입력하세요</p>"
                      className="h-64 font-mono text-sm"
                    />
                </div>
             </div>
          </div>

          {/* Right: Recipient List */}
          <div className="border rounded-lg p-4 bg-gray-50 flex flex-col h-full">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              수신자 목록
            </h3>
            
            <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px] space-y-2 bg-white border rounded p-2">
                {validRecipients.length > 0 ? (
                    <ul className="text-sm space-y-1">
                        {validRecipients.map((m, i) => (
                           <li key={`m-${i}-${m.email}`} className="flex justify-between border-b pb-1 last:border-0">
                               <span>{m.name_kor}</span>
                               <span className="text-gray-500 overflow-hidden text-ellipsis max-w-[200px]">{m.email}</span>
                           </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-10">유효한 수신자가 없습니다.</p>
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t flex justify-between items-center bg-white p-2 rounded">
                 <div className="text-sm font-medium">총 수신자: {validRecipients.length}명</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSend} disabled={sending || !subject || !html || validRecipients.length === 0}>
             {sending ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
             전송하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
