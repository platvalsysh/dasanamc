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
  seq: number;
}

interface InvalidRecipient {
  name_kor: string;
  email?: string;
  reason: string;
  seq: number;
}

interface ProfessorAllEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfessorAllEmailModal({ open, onOpenChange }: ProfessorAllEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);
  
  const [professors, setProfessors] = useState<any[]>([]);
  const [validRecipients, setValidRecipients] = useState<ValidRecipient[]>([]);
  const [invalidRecipients, setInvalidRecipients] = useState<InvalidRecipient[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Fetch all professors on open
  useEffect(() => {
    if (open) {
      setSubject("");
      setHtml("");
      setProfessors([]);
      setValidRecipients([]);
      setInvalidRecipients([]);
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
          if (p.email && p.email.trim() !== "") {
            valid.push({
              name_kor: p.name_kor,
              email: p.email,
              seq: p.seq,
            });
          } else {
            invalid.push({
              name_kor: p.name_kor,
              email: p.email,
              reason: "이메일 없음",
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



  const handleSend = async () => {
    if (!confirm(`총 ${validRecipients.length}명(전체 교수)에게 이메일을 전송하시겠습니까?`)) return;

    setSending(true);
    const recipients = validRecipients.map(p => ({
        email: p.email,
        name: p.name_kor,
    }));

    const formData = new FormData();
    formData.append("recipients", JSON.stringify(recipients));
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
        setSubject("");
        setHtml("");
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
          <DialogTitle>전체 교수 이메일 전송</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          {/* Left: Message Input */}
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
                     className="h-48 font-mono text-sm"
                   />
               </div>
            </div>
          </div>

          {/* Right: Preview (All Professors) */}
          <div className="border rounded-lg p-4 bg-gray-50 flex flex-col h-full">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              발송 대상 (전체 교수)
              {loadingPreview && <Loader2 className="animate-spin h-4 w-4" />}
            </h3>
            
            <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px] space-y-2 bg-white border rounded p-2">
                {validRecipients.length > 0 ? (
                    <ul className="text-sm space-y-1">
                        {validRecipients.map((p, i) => (
                           <li key={`p-${i}-${p.email}`} className="flex justify-between border-b pb-1 last:border-0 text-blue-700">
                               <span>{p.name_kor}</span>
                               <span className="text-gray-500 overflow-hidden text-ellipsis max-w-[200px]">{p.email}</span>
                           </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-10">
                         {loadingPreview ? "로딩 중..." : "발송 가능한 이메일이 없습니다."}
                    </p>
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t flex justify-between items-center bg-white p-2 rounded">
                 <div className="text-sm font-medium">총 발송 대상: {validRecipients.length}명</div>
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
