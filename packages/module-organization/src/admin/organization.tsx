import { type ActionFunctionArgs, type LoaderFunctionArgs, data } from "react-router";
import { Form, useFetcher, useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { useAuthServerContext } from "@repo/auth/server";
import { getSmsTestConfig } from "@repo/module-sms/server";
import { OrganizationService } from "../service.server";
import { Plus, Trash2, X, Mail, MessageSquare, Pencil, ArrowUp, ArrowDown } from "lucide-react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter, 
    Button,
    Input,
    Label,
    Checkbox
} from "@repo/ui-admin";
import { OrganizationGroupSmsModal } from "./components/OrganizationGroupSmsModal";
import { OrganizationGroupAlimtalkModal } from "./components/OrganizationGroupAlimtalkModal";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["organization.manage"])) {
        throw data({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const url = new URL(request.url);
    const q = url.searchParams.get("q");

    // If searching for bxmember
    if (q) {
        const results = await OrganizationService.searchBxMember(q);
        return data({ searchResults: results, mode: "search" as const });
    }

    const groups = await OrganizationService.getGroups();
    const members = await OrganizationService.getMembers();
    const smsTestConfig = getSmsTestConfig();
    return data({ groups, members, smsTestConfig, mode: "data" as const });
}

export type OrganizationLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;

export async function action({ request, context }: ActionFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["organization.manage"])) {
        throw data({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "createGroup") {
        const name = formData.get("name") as string;
        await OrganizationService.createGroup({ name });
    } else if (intent === "deleteGroup") {
        const id = formData.get("id") as string;
        await OrganizationService.deleteGroup(id);
    } else if (intent === "createPosition") {
        const name = formData.get("name") as string;
        const groupId = formData.get("groupId") as string;
        await OrganizationService.createPosition({ name, groupId });
    } else if (intent === "deletePosition") {
        const id = formData.get("id") as string;
        await OrganizationService.deletePosition(id);
    } else if (intent === "createMember") {
        const name = formData.get("name") as string;
        const major = formData.get("major") as string;
        const gisu = formData.get("gisu") as string;
        const groupId = formData.get("groupId") as string;
        const positionId = formData.get("positionId") as string;
        const memberId = formData.get("memberId") ? parseInt(formData.get("memberId") as string) : undefined;
        await OrganizationService.createMember({ name, major, gisu, groupId, positionId, memberId });
    } else if (intent === "deleteMember") {
        const id = formData.get("id") as string;
        await OrganizationService.deleteMember(id);
    } else if (intent === "updateGroup") {
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        await OrganizationService.updateGroup(id, { name, description });
    } else if (intent === "updatePosition") {
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        await OrganizationService.updatePosition(id, { name, description });
    } else if (intent === "moveGroup") {
        const id = formData.get("id") as string;
        const direction = formData.get("direction") as "up" | "down";
        await OrganizationService.moveGroup(id, direction);
    } else if (intent === "movePosition") {
        const id = formData.get("id") as string;
        const groupId = formData.get("groupId") as string;
        const direction = formData.get("direction") as "up" | "down";
        await OrganizationService.movePosition(id, groupId, direction);
    } else if (intent === "updateMember") {
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const major = formData.get("major") as string;
        const gisu = formData.get("gisu") as string;
        const positionId = formData.get("positionId") as string;
        const memberId = formData.get("memberId") ? parseInt(formData.get("memberId") as string) : undefined;
        await OrganizationService.updateMember(id, { name, major, gisu, positionId, memberId });
    } else if (intent === "moveMember") {
        const id = formData.get("id") as string;
        const positionId = formData.get("positionId") as string;
        const direction = formData.get("direction") as "up" | "down";
        await OrganizationService.moveMember(id, positionId, direction);
    }

    return data({ success: true });
}

export default function OrganizationAdmin() {
    const data = useLoaderData<typeof loader>();

    // Type Guard
    if (data.mode === "search") {
        return null; // Should be handled by fetcher, not main loader usually
    }

    const { groups, members } = data;
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

    // Member Form State
    const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
    // Group Message Modal States
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [isAlimtalkModalOpen, setIsAlimtalkModalOpen] = useState(false);

    const [memberForm, setMemberForm] = useState({
        name: "",
        major: "",
        gisu: "",
        memberId: "",
    });

    // Search State
    const searchFetcher = useFetcher<typeof loader>();
    const memberActionFetcher = useFetcher<typeof action>();
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Filter members by selection
    const filteredMembers = members.filter(m => {
        if (selectedPosition) return m.position_id === selectedPosition;
        if (selectedGroup) return m.group_id === selectedGroup;
        return true;
    });

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, intent: string, id: string, message: string } | null>(null);
    const [editGroup, setEditGroup] = useState<any>(null);
    const [editPosition, setEditPosition] = useState<any>(null);

    const moveItem = (intent: string, id: string, direction: "up" | "down", extra?: Record<string, string>) => {
        const fd = new FormData();
        fd.append("intent", intent);
        fd.append("id", id);
        fd.append("direction", direction);
        if (extra) Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
        memberActionFetcher.submit(fd, { method: "post" });
    };

    useEffect(() => {
        if (memberActionFetcher.state === "idle" && memberActionFetcher.data?.success) {
            setIsMemberFormOpen(false);
            setMemberForm({ name: "", major: "", gisu: "", memberId: "" });
            setEditGroup(null);
            setEditPosition(null);
        }
    }, [memberActionFetcher.state, memberActionFetcher.data]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">조직도 및 임원진 관리</h1>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsAlimtalkModalOpen(true)}
                        className="bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 h-9"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" /> 그룹 알림톡 발송
                    </Button>
                    <Button
                        onClick={() => setIsSmsModalOpen(true)}
                        className="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 h-9"
                    >
                        <Mail className="w-4 h-4 mr-2" /> 그룹 문자 발송
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Panel: Structure */}
                <div className="md:col-span-1 bg-white p-4 border border-gray-200 md:h-[calc(100vh-140px)] md:overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 
                            className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => { setSelectedGroup(null); setSelectedPosition(null); }}
                        >
                            직책 그룹 / 직책
                        </h2>
                        <Form method="post" className="flex gap-1">
                            <Input name="name" placeholder="새 그룹명" className="h-8 text-xs w-28" required />
                            <Button type="submit" name="intent" value="createGroup" size="icon" className="h-8 w-8">
                                <Plus size={14} />
                            </Button>
                        </Form>
                    </div>

                    <div className="space-y-4">
                        {groups.map((group: any) => (
                            <div key={group.id} className="border border-gray-200 p-3 mb-3">
                                <div className="flex justify-between items-start mb-2 group/header">
                                    <div
                                        className={`font-semibold cursor-pointer flex-1 ${selectedGroup === group.id ? 'text-blue-600' : ''}`}
                                        onClick={() => { setSelectedGroup(group.id); setSelectedPosition(null); }}
                                    >
                                        <div>{group.name}</div>
                                        {group.description && <div className="text-xs text-gray-500 font-normal mt-0.5">{group.description}</div>}
                                    </div>
                                    <div className="flex gap-1 items-center whitespace-nowrap">
                                        <button type="button" onClick={() => moveItem('moveGroup', group.id, 'up')} className="text-gray-400 hover:text-blue-500 p-1"><ArrowUp size={14}/></button>
                                        <button type="button" onClick={() => moveItem('moveGroup', group.id, 'down')} className="text-gray-400 hover:text-blue-500 p-1"><ArrowDown size={14}/></button>
                                        <button type="button" onClick={() => setEditGroup(group)} className="text-gray-400 hover:text-blue-500 p-1"><Pencil size={14}/></button>
                                        <button 
                                            type="button"
                                            onClick={() => setDeleteConfirm({ 
                                                open: true, 
                                                intent: "deleteGroup", 
                                                id: group.id, 
                                                message: `'\${group.name}' 그룹을 삭제하시겠습니까? 하위 직책도 모두 삭제됩니다.` 
                                            })}
                                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pl-2 border-l-2 border-gray-100 ml-1 space-y-1">
                                    {group.organization_positions.map((pos: any) => (
                                        <div key={pos.id} className="flex justify-between items-start group/item py-1">
                                            <div
                                                className={`text-sm cursor-pointer flex-1 ${selectedPosition === pos.id ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedGroup(group.id);
                                                    setSelectedPosition(pos.id);
                                                }}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>-</span>
                                                    <span>{pos.name}</span>
                                                </div>
                                                {pos.description && <div className="text-xs text-gray-400 font-normal ml-3">{pos.description}</div>}
                                            </div>
                                            <div className="flex gap-1 items-center whitespace-nowrap">
                                                <button type="button" onClick={() => moveItem('movePosition', pos.id, 'up', { groupId: group.id })} className="text-gray-400 hover:text-blue-500 p-1"><ArrowUp size={12}/></button>
                                                <button type="button" onClick={() => moveItem('movePosition', pos.id, 'down', { groupId: group.id })} className="text-gray-400 hover:text-blue-500 p-1"><ArrowDown size={12}/></button>
                                                <button type="button" onClick={() => setEditPosition(pos)} className="text-gray-400 hover:text-blue-500 p-1"><Pencil size={12}/></button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setDeleteConfirm({ 
                                                        open: true, 
                                                        intent: "deletePosition", 
                                                        id: pos.id, 
                                                        message: `'\${pos.name}' 직책을 삭제하시겠습니까? 소속된 임원도 해제됩니다.` 
                                                    })}
                                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <Form method="post" className="flex gap-1 mt-2">
                                        <input type="hidden" name="groupId" value={group.id} />
                                        <Input name="name" placeholder="직책 추가" className="h-8 text-xs w-full" required />
                                        <Button type="submit" name="intent" value="createPosition" variant="secondary" size="icon" className="h-8 w-8 shrink-0">
                                            <Plus size={14} />
                                        </Button>
                                    </Form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Members */}
                <div className="md:col-span-2 bg-white p-4 border border-gray-200 md:h-[calc(100vh-140px)] md:overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">임원 명단</h2>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>
                                    {selectedPosition
                                        ? `${groups.find((g) => g.id === selectedGroup)?.name} > ${groups.find((g) => g.id === selectedGroup)?.organization_positions.find((p) => p.id === selectedPosition)?.name}`
                                        : selectedGroup
                                            ? groups.find((g) => g.id === selectedGroup)?.name
                                            : "전체 보기"}
                                </span>
                                {(selectedGroup || selectedPosition) && (
                                    <button
                                        onClick={() => {
                                            setSelectedGroup(null);
                                            setSelectedPosition(null);
                                        }}
                                        className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-0.5 transition-colors border border-gray-200"
                                    >
                                        전체 보기
                                    </button>
                                )}
                            </div>
                        </div>
                        {selectedGroup && selectedPosition ? (
                            <Button
                                onClick={() => setIsMemberFormOpen(true)}
                                size="sm"
                                className="h-9"
                            >
                                <Plus className="w-4 h-4 mr-1" /> 임원 등록
                            </Button>
                        ) : (
                            <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 border border-gray-100">
                                👈 임원을 등록하려면 좌측에서 직책을 선택하세요
                            </div>
                        )}
                    </div>

                    {/* Member List Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase">
                                <tr>
                                    <th className="px-4 py-3">직책</th>
                                    <th className="px-4 py-3">성명</th>
                                    <th className="px-4 py-3">전공</th>
                                    <th className="px-4 py-3">기수</th>
                                    <th className="px-4 py-3">동문연동</th>
                                    <th className="px-4 py-3">가입상태</th>
                                    <th className="px-4 py-3 text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredMembers.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">등록된 임원이 없습니다.</td></tr>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{member.organization_positions.name}</td>
                                            <td className="px-4 py-3 font-medium">{member.name}</td>
                                            <td className="px-4 py-3">{member.major || '-'}</td>
                                            <td className="px-4 py-3">{member.gisu || '-'}</td>
                                            <td className="px-4 py-3">
                                                {member.member_id ? (
                                                    <span className="bg-green-50 text-green-700 px-2 py-0.5 border border-green-200 text-[10px] font-medium">연동됨</span>
                                                ) : (
                                                    <span className="bg-gray-50 text-gray-500 px-2 py-0.5 border border-gray-200 text-[10px] font-medium">직접입력</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {member.member_id ? (
                                                    member.bxmember?.user_id ? (
                                                        <span className="text-blue-600 font-medium text-xs">가입</span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">미가입</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <button type="button" onClick={() => moveItem('moveMember', member.id, 'up', { positionId: member.position_id })} className="text-gray-400 hover:text-blue-500 p-1"><ArrowUp size={16}/></button>
                                                    <button type="button" onClick={() => moveItem('moveMember', member.id, 'down', { positionId: member.position_id })} className="text-gray-400 hover:text-blue-500 p-1"><ArrowDown size={16}/></button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setDeleteConfirm({ 
                                                            open: true, 
                                                            intent: "deleteMember", 
                                                            id: member.id, 
                                                            message: `'\${member.name}' 임원을 삭제하시겠습니까?` 
                                                        })}
                                                        className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Member Registration Modal */}
          <Dialog open={isMemberFormOpen} onOpenChange={setIsMemberFormOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>임원 등록</DialogTitle>
              </DialogHeader>

                        <div className="space-y-4">
                            {/* Search Section */}
                            <div className="relative space-y-1">
                                <Label className="text-xs">동문 검색 (성명)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="이름을 입력하세요"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val.length >= 2) {
                                                searchFetcher.load(`?q=${val}`);
                                                setShowSearchResults(true);
                                            } else {
                                                setShowSearchResults(false);
                                            }
                                        }}
                                    />
                                </div>

                                {/* Search Results Dropdown */}
                                {showSearchResults && searchFetcher.data && searchFetcher.data.mode === 'search' && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 max-h-48 overflow-y-auto">
                                        {searchFetcher.data.searchResults?.map((res) => (
                                            <div
                                                key={res.seq}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                                                onClick={() => {
                                                    setMemberForm({
                                                        name: res.name_kor || "",
                                                        major: res.major || "",
                                                        gisu: res.graduate_number ? res.graduate_number.toString() : "",
                                                        memberId: res.seq.toString(),
                                                    });
                                                    setShowSearchResults(false);
                                                }}
                                            >
                                                <span className="font-bold">{res.name_kor}</span>
                                                <span className="text-gray-400 ml-2 text-xs">{res.graduate_number ? `${res.graduate_number}회` : '-'} | {res.major} | {res.graduate_year}졸</span>
                                            </div>
                                        ))}
                                        {searchFetcher.data?.searchResults?.length === 0 && (
                                            <div className="px-4 py-2 text-gray-400 text-sm">검색 결과가 없습니다.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t my-4 border-gray-100"></div>

                            <memberActionFetcher.Form id="create-member-form" method="post" className="space-y-4">
                                <input type="hidden" name="intent" value="createMember" />
                                <input type="hidden" name="groupId" value={selectedGroup || ""} />
                                <input type="hidden" name="positionId" value={selectedPosition || ""} />
                                <input type="hidden" name="memberId" value={memberForm.memberId} />

                                <div className="space-y-1">
                                    <Label className="text-xs">성명</Label>
                                    <Input
                                        name="name"
                                        value={memberForm.name}
                                        onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                                        className="bg-gray-50"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">전공</Label>
                                        <Input
                                            name="major"
                                            value={memberForm.major}
                                            onChange={e => setMemberForm({ ...memberForm, major: e.target.value })}
                                            className="bg-gray-50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">기수/졸업년도</Label>
                                        <Input
                                            name="gisu"
                                            value={memberForm.gisu}
                                            onChange={e => setMemberForm({ ...memberForm, gisu: e.target.value })}
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </memberActionFetcher.Form>
                        </div>

                <DialogFooter className="pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsMemberFormOpen(false)}>취소</Button>
                  <Button onClick={() => (document.getElementById("create-member-form") as HTMLFormElement)?.requestSubmit()}>등록하기</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>

            <OrganizationGroupSmsModal 
                open={isSmsModalOpen} 
                onOpenChange={setIsSmsModalOpen}
                groups={groups}
                members={members}
                smsTestConfig={data.smsTestConfig}
            />
            <OrganizationGroupAlimtalkModal 
                open={isAlimtalkModalOpen} 
                onOpenChange={setIsAlimtalkModalOpen}
                groups={groups}
                members={members}
                smsTestConfig={data.smsTestConfig}
            />

            {/* Edit Group Modal */}
            <Dialog open={!!editGroup} onOpenChange={(open) => !open && setEditGroup(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>그룹 수정</DialogTitle>
                    </DialogHeader>
                    <memberActionFetcher.Form method="post" onSubmit={() => setEditGroup(null)}>
                        <div className="space-y-4 py-4">
                            <input type="hidden" name="intent" value="updateGroup" />
                            <input type="hidden" name="id" value={editGroup?.id} />
                            <div className="space-y-1">
                                <Label>그룹명</Label>
                                <Input name="name" defaultValue={editGroup?.name} required />
                            </div>
                            <div className="space-y-1">
                                <Label>설명</Label>
                                <Input name="description" defaultValue={editGroup?.description || ""} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditGroup(null)}>취소</Button>
                            <Button type="submit">저장</Button>
                        </DialogFooter>
                    </memberActionFetcher.Form>
                </DialogContent>
            </Dialog>

            {/* Edit Position Modal */}
            <Dialog open={!!editPosition} onOpenChange={(open) => !open && setEditPosition(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>직책 수정</DialogTitle>
                    </DialogHeader>
                    <memberActionFetcher.Form method="post" onSubmit={() => setEditPosition(null)}>
                        <div className="space-y-4 py-4">
                            <input type="hidden" name="intent" value="updatePosition" />
                            <input type="hidden" name="id" value={editPosition?.id} />
                            <div className="space-y-1">
                                <Label>직책명</Label>
                                <Input name="name" defaultValue={editPosition?.name} required />
                            </div>
                            <div className="space-y-1">
                                <Label>설명</Label>
                                <Input name="description" defaultValue={editPosition?.description || ""} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditPosition(null)}>취소</Button>
                            <Button type="submit">저장</Button>
                        </DialogFooter>
                    </memberActionFetcher.Form>
                </DialogContent>
            </Dialog>

            {/* Global Delete Confirmation Dialog */}
            {deleteConfirm && (
                <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>삭제 확인</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>{deleteConfirm.message}</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>취소</Button>
                            <Form method="post" onSubmit={() => setDeleteConfirm(null)}>
                                <input type="hidden" name="intent" value={deleteConfirm.intent} />
                                <input type="hidden" name="id" value={deleteConfirm.id} />
                                <Button type="submit" variant="destructive">삭제</Button>
                            </Form>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
