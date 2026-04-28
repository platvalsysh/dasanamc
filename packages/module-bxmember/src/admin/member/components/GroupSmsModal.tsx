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
import { GroupTransferList } from "./GroupTransferList";
import { Loader2 } from "lucide-react";



interface GroupSmsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  smsTestConfig: { mode: "test", testNumber: string } | { mode: "production" };
}

interface ValidRecipient {
  name_kor: string;
  cellphone_number: string;
  id?: string;
  major?: string;
  seq?: number;
  type: 'member' | 'professor' | 'emeritus';
}

interface InvalidRecipient {
  name_kor: string;
  cellphone_number?: string;
  id?: string;
  major?: string;
  seq?: number;
  reason: string;
  type: 'member' | 'professor' | 'emeritus';
}

export function GroupSmsModal({ open, onOpenChange, smsTestConfig }: GroupSmsModalProps) {
  const [groups, setGroups] = useState<string[]>([]);
  
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [includeProfessors, setIncludeProfessors] = useState(false);
  const [includeEmeritus, setIncludeEmeritus] = useState(false);
  
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [emeritusList, setEmeritusList] = useState<any[]>([]);
  const [groupCache, setGroupCache] = useState<Record<string, any[]>>({});
  
  const [validRecipients, setValidRecipients] = useState<ValidRecipient[]>([]);
  const [invalidRecipients, setInvalidRecipients] = useState<InvalidRecipient[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);

  // Confim & Result Dialog States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<{open: boolean, title: string, message: string} | null>(null);

  // Fetch options on mount/open
  useEffect(() => {
    if (open) {
      // Create a fresh start
      setSelectedGroups([]);
      setMessage("");
      setMembers([]);
      setValidRecipients([]);
      setInvalidRecipients([]);
      setConfirmOpen(false);
      setResultDialog(null);
      
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

      // Fetch emeritus
      fetch("/admin/api/bxmember/emeritus/all", { method: "POST" })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setEmeritusList(res.data.emerituss);
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
  }, [selectedGroups, includeProfessors, includeEmeritus, open]);

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

    // Remove duplicates (same member might be in multiple selected criteria if any overlap? unlikely given the group structure but safer)
    // Actually duplication happens if one member has multiple majors or fits multiple criteria.
    // Use Set on 'seq' or 'id' to deduplicate.
    const uniqueMembersMap = new Map();
    aggregatedMembers.forEach(m => uniqueMembersMap.set(m.seq, m));
    const uniqueMembers = Array.from(uniqueMembersMap.values());
    
    setMembers(uniqueMembers);
    
    // 4. Calculate Recipients (Members + Professors)
    const valid: ValidRecipient[] = [];
    const invalid: InvalidRecipient[] = [];

    // Process Members
    for (const m of uniqueMembers) {
      if (isValidPhoneNumber(m.cellphone_number)) {
          valid.push({
              name_kor: m.name_kor,
              id: m.id,
              major: m.major,
              seq: m.seq,
              cellphone_number: m.cellphone_number!,
              type: 'member'
          });
      } else {
          invalid.push({
              name_kor: m.name_kor,
              id: m.id,
              major: m.major,
              seq: m.seq,
              cellphone_number: m.cellphone_number,
              reason: m.cellphone_number ? "형식 오류" : "번호 없음",
              type: 'member'
          });
      }
    }

    // Process Professors
    if (includeProfessors) {
        for (const p of professors) {
            if (isValidPhoneNumber(p.cellphone_number)) {
                valid.push({
                    name_kor: p.name_kor,
                    cellphone_number: p.cellphone_number!,
                    type: 'professor'
                });
            } else {
                invalid.push({
                    name_kor: p.name_kor,
                    cellphone_number: p.cellphone_number,
                    reason: p.cellphone_number ? "형식 오류" : "번호 없음",
                    type: 'professor'
                });
            }
        }
    }

    // Process Emeritus
    if (includeEmeritus) {
        for (const p of emeritusList) {
            if (isValidPhoneNumber(p.cellphone_number)) {
                valid.push({
                    name_kor: p.name_kor,
                    cellphone_number: p.cellphone_number!,
                    type: 'emeritus'
                });
            } else {
                invalid.push({
                    name_kor: p.name_kor,
                    cellphone_number: p.cellphone_number,
                    reason: p.cellphone_number ? "형식 오류" : "번호 없음",
                    type: 'emeritus'
                });
            }
        }
    }

    setValidRecipients(valid);
    setInvalidRecipients(invalid);
  };

  const isValidPhoneNumber = (phone?: string) => {
    const p = phone?.replace(/[^0-9]/g, "");
    return !!(p && p.length >= 10 && p.startsWith("01"));
  };



  const handleSendClick = () => {
    setConfirmOpen(true);
  };

  const executeSend = async () => {
    setConfirmOpen(false); 
    setSending(true);
    const recipients = validRecipients.map(r => ({
        phone: r.cellphone_number,
        name: r.name_kor,
        type: r.type
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
        setSelectedGroups([]);
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
          <DialogTitle>그룹 문자 전송</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          {/* Left: Input Selection */}
          <div className="space-y-6">
            {smsTestConfig.mode === "test" && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md text-sm">
                    <p className="font-bold mb-1">⚠️ 테스트 모드 활성화</p>
                    <p>모든 발송이 <strong>{smsTestConfig.testNumber}</strong> 번호로 전송됩니다.</p>
                </div>
            )}
            <GroupTransferList
              groups={groups}
              selectedGroups={selectedGroups}
              setSelectedGroups={setSelectedGroups}
            />

            <div className="flex flex-wrap items-center gap-6 border-t pt-4">
              <div className="flex items-center space-x-2">
                 <input
                   type="checkbox"
                   id="includeProfessors"
                   className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                   checked={includeProfessors}
                   onChange={(e) => setIncludeProfessors(e.target.checked)}
                 />
                 <Label htmlFor="includeProfessors" className="font-normal cursor-pointer select-none">
                   교수진 포함
                 </Label>
              </div>
              <div className="flex items-center space-x-2">
                 <input
                   type="checkbox"
                   id="includeEmeritus"
                   className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                   checked={includeEmeritus}
                   onChange={(e) => setIncludeEmeritus(e.target.checked)}
                 />
                 <Label htmlFor="includeEmeritus" className="font-normal cursor-pointer select-none">
                   명예교수진 포함
                 </Label>
              </div>
            </div>

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
                            {validRecipients.map((m, i) => (
                                <li key={`valid-${i}`} className={`flex justify-between border-b pb-1 last:border-0 ${(m.type === 'professor' || m.type === 'emeritus') ? 'text-blue-700' : ''}`}>
                                    <span>{m.name_kor} {m.type === 'member' ? `(${m.major || "전공미상"})` : m.type === 'professor' ? '(교수)' : '(명예교수)'}</span>
                                    <span className="text-gray-500">{m.cellphone_number}</span>
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
                                ⚠️ 연락처 미등록 회원은 발송에서 제외됩니다.
                            </div>
                            <ul className="text-sm space-y-1">
                                {invalidRecipients.map((m, i) => (
                                    <li key={`inv-${i}`} className="flex justify-between border-b pb-1 last:border-0 text-gray-500">
                                        <span>{m.name_kor} {m.type === 'member' ? `(${m.major || "전공미상"})` : m.type === 'professor' ? '(교수)' : '(명예교수)'}</span>
                                        <span className="text-red-400 text-xs">{m.cellphone_number}</span>
                                        <span className="text-red-400 text-xs">{m.reason}</span>
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
                    <p>총 <strong>{validRecipients.length}명</strong>에게 메시지를 전송하시겠습니까?</p>
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
