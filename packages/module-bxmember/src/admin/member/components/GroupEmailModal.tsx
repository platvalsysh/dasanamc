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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui-admin";
import { GroupTransferList } from "./GroupTransferList";
import { Loader2 } from "lucide-react";

interface ValidRecipient {
  name_kor: string;
  email: string;
  major?: string;
  type: 'member' | 'professor';
}

interface InvalidRecipient {
  name_kor: string;
  email?: string;
  major?: string;
  reason: string;
  type: 'member' | 'professor';
}

interface GroupEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupEmailModal({ open, onOpenChange }: GroupEmailModalProps) {
  const [groups, setGroups] = useState<string[]>([]);
  
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [includeProfessors, setIncludeProfessors] = useState(false);
  
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  
  const [previewData, setPreviewData] = useState<{ count: number; members: any[]; professors: any[] } | null>(null);
  const [professors, setProfessors] = useState<any[]>([]);
  const [groupCache, setGroupCache] = useState<Record<string, any[]>>({});
  const [validRecipients, setValidRecipients] = useState<ValidRecipient[]>([]);
  const [invalidRecipients, setInvalidRecipients] = useState<InvalidRecipient[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch options on mount/open
  useEffect(() => {
    if (open) {
       // Create a fresh start
      setSelectedGroups([]);
      setSubject("");
      setHtml("");
      setPreviewData(null);
      setValidRecipients([]);
      setInvalidRecipients([]);

      fetch("/admin/api/bxmember/member/options", { method: "POST" })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setGroups(res.data.groups);
          }
        });

      // Fetch all professors once
      fetch("/admin/api/bxmember/professor/all", { method: "POST" })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setProfessors(res.data.professors);
          }
        });
    }
  }, [open]);

  // Fetch preview when selection changes
  useEffect(() => {
    if (!open) return;
    
    const timeoutId = setTimeout(() => {
       fetchPreview();
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [selectedGroups, includeProfessors, open]);

  const fetchPreview = async () => {
    // 1. Identify missing groups in cache
    const groupsToFetch = selectedGroups.filter(g => !groupCache[g]);
    
    // 2. Fetch missing groups if any
    let updatedCache = { ...groupCache };

    if (groupsToFetch.length > 0) {
      setLoadingPreview(true);
      try {
        const formData = new FormData();
        formData.append("groups", JSON.stringify(groupsToFetch));
        
        const res = await fetch("/admin/api/bxmember/member/preview", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
            const fetchedMembers = data.data.members || [];
            
            // Distribute fetched members to their respective groups in cache
            groupsToFetch.forEach(groupId => {
                const separatorIndex = groupId.indexOf("-");
                if (separatorIndex !== -1) {
                    const gNum = groupId.substring(0, separatorIndex);
                    const gMajor = groupId.substring(separatorIndex + 1);
                    
                    const membersForGroup = fetchedMembers.filter((m: any) => 
                        m.graduate_number === gNum && m.major === gMajor
                    );
                    updatedCache[groupId] = membersForGroup;
                } else {
                    updatedCache[groupId] = [];
                }
            });
            
            setGroupCache({...updatedCache});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPreview(false);
      }
    } else {
        updatedCache = groupCache; // All present
    }

    // 3. Aggregate all selected groups from cache
    let aggregatedMembers: any[] = [];
    selectedGroups.forEach(g => {
        if (updatedCache[g]) {
            aggregatedMembers = [...aggregatedMembers, ...updatedCache[g]];
        }
    });

    // Remove duplicates
    const uniqueMembersMap = new Map();
    aggregatedMembers.forEach(m => uniqueMembersMap.set(m.seq, m));
    const uniqueMembers = Array.from(uniqueMembersMap.values());
    
    // 4. Calculate Recipients (Members + Professors)
    const valid: ValidRecipient[] = [];
    const invalid: InvalidRecipient[] = [];

    // Process Members
    for (const m of uniqueMembers) {
        if (m.email && m.email.trim() !== "") {
            valid.push({
            name_kor: m.name_kor,
            email: m.email,
            major: m.major,
            type: 'member'
            });
        } else {
            invalid.push({
            name_kor: m.name_kor,
            email: m.email,
            major: m.major,
            reason: "이메일 없음",
            type: 'member'
            });
        }
    }

    // Process Professors
    if (includeProfessors) {
        for (const p of professors) {
            if (p.email && p.email.trim() !== "") {
                valid.push({
                name_kor: p.name_kor,
                email: p.email,
                type: 'professor'
                });
            } else {
                invalid.push({
                name_kor: p.name_kor,
                email: p.email,
                reason: "이메일 없음",
                type: 'professor'
                });
            }
        }
    }

    setValidRecipients(valid);
    setInvalidRecipients(invalid);
  };

  const handleSend = async () => {
    if (!confirm(`총 ${validRecipients.length}명에게 이메일을 전송하시겠습니까?`)) return;

    setSending(true);
    const recipients = validRecipients.map(r => ({
      email: r.email,
      name: r.name_kor,
      type: r.type
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
        setSelectedGroups([]);
        // setIncludeProfessors(false);
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
          <DialogTitle>그룹 이메일 전송</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          {/* Left: Input Selection */}
          <div className="space-y-6">
            <GroupTransferList
              groups={groups}
              selectedGroups={selectedGroups}
              setSelectedGroups={setSelectedGroups}
            />

            <div className="flex items-center space-x-2 border-t pt-4">
               <input
                 type="checkbox"
                 id="includeProfessors"
                 className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                 checked={includeProfessors}
                 onChange={(e) => setIncludeProfessors(e.target.checked)}
               />
               <Label htmlFor="includeProfessors" className="font-normal cursor-pointer select-none">
                 교수진 포함 (그룹 선택과 별개로 추가)
               </Label>
            </div>

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

          {/* Right: Preview (Staging) */}
          <div className="border rounded-lg p-4 bg-gray-50 flex flex-col h-full">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              발송 대상 미리보기 
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
                            {validRecipients.map((r, i) => (
                               <li key={`v-${i}`} className={`flex justify-between border-b pb-1 last:border-0 ${r.type === 'professor' ? 'text-blue-700' : ''}`}>
                                   <span>{r.name_kor} {r.type === 'member' ? `(${r.major || "전공미상"})` : '(교수)'}</span>
                                   <span className="text-gray-500 overflow-hidden text-ellipsis max-w-[150px]">{r.email}</span>
                               </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-10">
                            {loadingPreview ? "로딩 중..." : "발송 가능한 대상이 없습니다."}
                        </p>
                    )}
                </TabsContent>

                <TabsContent value="invalid" className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px] bg-white border rounded p-2 mt-2">
                    {invalidRecipients.length > 0 ? (
                        <div className="space-y-2">
                            <div className="text-xs text-red-500 bg-red-50 p-2 rounded mb-2">
                                ⚠️ 이메일 미등록 회원은 발송에서 제외됩니다.
                            </div>
                            <ul className="text-sm space-y-1 text-gray-500">
                                {invalidRecipients.map((r, i) => (
                                   <li key={`inv-${i}`} className="flex justify-between border-b pb-1 last:border-0">
                                       <span>{r.name_kor} {r.type === 'member' ? `(${r.major || "전공미상"})` : '(교수)'}</span>
                                       <span className="text-red-400 text-xs">{r.reason}</span>
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
          <Button onClick={handleSend} disabled={sending || !subject || !html || validRecipients.length === 0}>
             {sending ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
             전송하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
