import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui-admin";
import { GroupTransferList } from "./GroupTransferList";
import { Loader2 } from "lucide-react";
import { AlimtalkTemplateSelector, type AlimtalkTemplate } from "./AlimtalkTemplateSelector";

interface GroupAlimtalkModalProps {
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
  reason: string;
  type: 'member' | 'professor' | 'emeritus';
}

export function GroupAlimtalkModal({ open, onOpenChange, smsTestConfig }: GroupAlimtalkModalProps) {
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [includeProfessors, setIncludeProfessors] = useState(false);
  const [includeEmeritus, setIncludeEmeritus] = useState(false);
  
  const [template, setTemplate] = useState<AlimtalkTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [variablesExtra, setVariablesExtra] = useState<Record<string, string>>({});
  
  const [members, setMembers] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [emeritusList, setEmeritusList] = useState<any[]>([]);
  const [groupCache, setGroupCache] = useState<Record<string, any[]>>({});
  
  const [validRecipients, setValidRecipients] = useState<ValidRecipient[]>([]);
  const [invalidRecipients, setInvalidRecipients] = useState<InvalidRecipient[]>([]);
  
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<{open: boolean, title: string, message: string} | null>(null);

  // Initial Fetch
  useEffect(() => {
    if (open) {
      setSelectedGroups([]);
      setTemplate(null);
      setVariables({});
      setVariablesExtra({});
      setConfirmOpen(false);
      
      // Fetch groups
      fetch("/admin/api/bxmember/member/options", { method: "POST" })
        .then(res => res.json())
        .then(res => { if (res.success) setGroups(res.data.groups); });

      // Fetch professors
      fetch("/admin/api/bxmember/professor/all", { method: "POST" })
        .then(res => res.json())
        .then(res => { if (res.success) setProfessors(res.data.professors); });

      // Fetch emeritus
      fetch("/admin/api/bxmember/emeritus/all", { method: "POST" })
        .then(res => res.json())
        .then(res => { if (res.success) setEmeritusList(res.data.emerituss); });
    }
  }, [open]);

  // Preview Logic (Similar to GroupSmsModal)
  useEffect(() => {
    if (!open) return;
    const timeoutId = setTimeout(() => { fetchPreview(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedGroups, includeProfessors, includeEmeritus, open]);

  const fetchPreview = async () => {
    const groupsToFetch = selectedGroups.filter(g => !groupCache[g]);
    let updatedCache = { ...groupCache };
    
    if (groupsToFetch.length > 0) {
      setLoadingPreview(true);
      try {
        const formData = new FormData();
        formData.append("groups", JSON.stringify(groupsToFetch));
        const res = await fetch("/admin/api/bxmember/member/preview", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
            const fetchedMembers = data.data.members || [];
            groupsToFetch.forEach(groupId => {
                const sep = groupId.indexOf("-");
                if (sep !== -1) {
                    const gNum = groupId.substring(0, sep);
                    const gMajor = groupId.substring(sep + 1);
                    updatedCache[groupId] = fetchedMembers.filter((m: any) => m.graduate_number === gNum && m.major === gMajor);
                } else { updatedCache[groupId] = []; }
            });
            setGroupCache({...updatedCache});
        }
      } catch (e) { console.error(e); } finally { setLoadingPreview(false); }
    } else { updatedCache = groupCache; }

    let aggregatedMembers: any[] = [];
    selectedGroups.forEach(g => { if (updatedCache[g]) aggregatedMembers = [...aggregatedMembers, ...updatedCache[g]]; });
    const uniqueMembersMap = new Map();
    aggregatedMembers.forEach(m => uniqueMembersMap.set(m.seq, m));
    const uniqueMembers = Array.from(uniqueMembersMap.values());
    setMembers(uniqueMembers);
    
    const valid: ValidRecipient[] = [];
    const invalid: InvalidRecipient[] = [];
    for (const m of uniqueMembers) {
      if (isValidPhoneNumber(m.cellphone_number)) { 
          valid.push({ name_kor: m.name_kor, id: m.id, major: m.major, seq: m.seq, cellphone_number: m.cellphone_number!, type: 'member' });
      } else { 
          invalid.push({ name_kor: m.name_kor, reason: m.cellphone_number ? "형식 오류" : "번호 없음", type: 'member' }); 
      }
    }
    if (includeProfessors) {
        for (const p of professors) {
            if (isValidPhoneNumber(p.cellphone_number)) { 
                valid.push({ name_kor: p.name_kor, cellphone_number: p.cellphone_number!, type: 'professor' }); 
            } else { 
                invalid.push({ name_kor: p.name_kor, reason: p.cellphone_number ? "형식 오류" : "번호 없음", type: 'professor' }); 
            }
        }
    }
    if (includeEmeritus) {
        for (const p of emeritusList) {
            if (isValidPhoneNumber(p.cellphone_number)) { 
                valid.push({ name_kor: p.name_kor, cellphone_number: p.cellphone_number!, type: 'emeritus' }); 
            } else { 
                invalid.push({ name_kor: p.name_kor, reason: p.cellphone_number ? "형식 오류" : "번호 없음", type: 'emeritus' }); 
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

  const executeSend = async () => {
    if (!template) return;
    setConfirmOpen(false); 
    setSending(true);
    
    const recipients = validRecipients.map(r => ({ phone: r.cellphone_number, name: r.name_kor }));
    const formData = new FormData();
    formData.append("recipients", JSON.stringify(recipients));
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
        setSelectedGroups([]);
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
        <DialogHeader><DialogTitle>그룹 알림톡 전송</DialogTitle></DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          <div className="space-y-6">
            {smsTestConfig.mode === "test" && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md text-sm">
                    <p className="font-bold mb-1">⚠️ 테스트 모드 활성화</p>
                    <p>모든 발송이 <strong>{smsTestConfig.testNumber}</strong> 번호로 전송됩니다.</p>
                </div>
            )}
            <GroupTransferList groups={groups} selectedGroups={selectedGroups} setSelectedGroups={setSelectedGroups} />

            <div className="flex items-center space-x-6 border-t pt-4">
              <div className="flex items-center space-x-2">
                 <input type="checkbox" id="includeProfessors" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={includeProfessors} onChange={(e) => setIncludeProfessors(e.target.checked)} />
                 <Label htmlFor="includeProfessors" className="font-normal cursor-pointer select-none">교수진 포함</Label>
              </div>
              <div className="flex items-center space-x-2">
                 <input type="checkbox" id="includeEmeritus" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={includeEmeritus} onChange={(e) => setIncludeEmeritus(e.target.checked)} />
                 <Label htmlFor="includeEmeritus" className="font-normal cursor-pointer select-none">명예교수진 포함</Label>
              </div>
            </div>

            <AlimtalkTemplateSelector onSelectionChange={(t, v, ve) => {
              setTemplate(t);
              setVariables(v);
              setVariablesExtra(ve);
            }} />
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 flex flex-col h-full">
            <h3 className="font-semibold mb-2 flex items-center gap-2">발송 대상 미리보기 {loadingPreview && <Loader2 className="animate-spin h-4 w-4" />}</h3>
            <Tabs defaultValue="valid" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="valid">발송 대상 ({validRecipients.length})</TabsTrigger>
                    <TabsTrigger value="invalid">제외 대상 ({invalidRecipients.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="valid" className="flex-1 overflow-y-auto min-h-75 max-h-125 bg-white border rounded p-2 mt-2">
                    {validRecipients.length > 0 ? (
                        <ul className="text-sm space-y-1">
                            {validRecipients.map((m, i) => (
                                <li key={`valid-${i}`} className="flex justify-between border-b pb-1 last:border-0">
                                    <span>{m.name_kor} {m.type === 'member' ? `(${m.major || "전공미상"})` : m.type === 'professor' ? '(교수)' : '(명예교수)'}</span>
                                    <span className="text-gray-500">{m.cellphone_number}</span>
                                </li>
                            ))}
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
