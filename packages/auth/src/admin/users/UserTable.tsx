import { useState, useEffect } from "react";
import { 
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui-admin";
import {
  Eye,
  Edit,
  Mail,
  Trash2,
  Lock as LockIcon,
  Shield,
  CheckCircle,
  XCircle,
  User as UserIcon,
  GraduationCap,
  Briefcase,
  Settings,
  Info,
  Search,
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@repo/ui-admin";
import { useFetcher, useSearchParams, useLoaderData } from "react-router";
import type { AdminUsersLoaderData } from "./page";


type AlumniRow = {
  seq: number;
  name_kor?: string;
  email?: string;
  cellphone_number?: string;
  major?: string;
  graduate_year?: string | number;
  user_id?: string | null;
  user_name?: string;
  email_address?: string;
  enter_year?: string;
};

type UserActionData = {
  success?: boolean;
  error?: string;
  message?: string;
  alumni?: AlumniRow[];
  intent?: string;
};

interface UserTableProps {
  users: AdminUsersLoaderData['users'];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterRole: string;
  filterStatus: string;
  selectedUsers: Set<string>;
  onToggleAll: (checked: boolean) => void;
  onToggleUser: (userId: string) => void;
  fetchUsers: () => void;
}

export function UserTable({
  users,
  loading,
  error,
  searchTerm,
  filterRole,
  filterStatus,
  selectedUsers,
  onToggleAll,
  onToggleUser,
  fetchUsers,
}: UserTableProps) {
  const fetcher = useFetcher<UserActionData>();
  const [searchParams] = useSearchParams();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Modal States
  const [passwordModal, setPasswordModal] = useState<{ open: boolean; userId: string; userName: string }>({
    open: false,
    userId: "",
    userName: "",
  });
  const [detailModal, setDetailModal] = useState<{ 
    open: boolean; 
    user: AdminUsersLoaderData['users'][number] | null; 
    mode: "view" | "edit";
  }>({
    open: false,
    user: null,
    mode: "view",
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: AdminUsersLoaderData['users'][number] | null }>({
    open: false,
    user: null,
  });
  const [emailModal, setEmailModal] = useState<{ open: boolean; userId: string; currentEmail: string }>({
    open: false,
    userId: "",
    currentEmail: "",
  });
  const [matchModal, setMatchModal] = useState<{ open: boolean; user: AdminUsersLoaderData['users'][number] | null }>({
    open: false,
    user: null,
  });
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [alumniSearch, setAlumniSearch] = useState<{
    results: AlumniRow[];
    loading: boolean;
    query: { name: string; phone: string; email: string; year: string };
  }>({
    results: [],
    loading: false,
    query: { name: "", phone: "", email: "", year: "" },
  });

  // Pre-fill search when modal opens
  useEffect(() => {
    if (matchModal.open && matchModal.user) {
      const initialQuery = {
        name: matchModal.user.name || "",
        phone: matchModal.user.phone || "",
        email: matchModal.user.email || "",
        year: "",
      };
      setAlumniSearch(prev => ({
        ...prev,
        query: initialQuery
      }));
      handleSearchAlumni(initialQuery);
    } else {
      setAlumniSearch({
        results: [],
        loading: false,
        query: { name: "", phone: "", email: "", year: "" },
      });
    }
  }, [matchModal.open, matchModal.user]);

  const handleSearchAlumni = (query: { name: string; phone: string; email: string; year: string }) => {
    setAlumniSearch(prev => ({ ...prev, loading: true }));
    const formData = new FormData();
    formData.append("intent", "search-alumni");
    formData.append("name", query.name);
    formData.append("phone", query.phone);
    formData.append("email", query.email);
    formData.append("year", query.year);
    fetcher.submit(formData, { method: "post" });
  };

  const handleMatchAlumni = (alumniSeq: number) => {
    if (!matchModal.user) return;
    const formData = new FormData();
    formData.append("intent", "match-alumni");
    formData.append("userId", matchModal.user.id);
    formData.append("alumniSeq", alumniSeq.toString());
    fetcher.submit(formData, { method: "post" });
  };

  const [unmatchConfirmOpen, setUnmatchConfirmOpen] = useState(false);
  const [unmatchConfirmText, setUnmatchConfirmText] = useState("");

  const handleUnmatchAlumni = () => {
    if (!matchModal.user || unmatchConfirmText !== "매칭해제") return;
    const formData = new FormData();
    formData.append("intent", "unmatch-alumni");
    formData.append("userId", matchModal.user.id);
    fetcher.submit(formData, { method: "post" });
    setUnmatchConfirmOpen(false);
    setUnmatchConfirmText("");
  };

  // Update search results when fetcher completes
  useEffect(() => {
    if (fetcher.data?.alumni) {
      setAlumniSearch(prev => ({
        ...prev,
        results: fetcher.data!.alumni!,
        loading: false
      }));
    }
    if (fetcher.data?.success && (fetcher.data.intent === "match-alumni" || fetcher.data.intent === "unmatch-alumni")) {
      setMatchModal(prev => ({ ...prev, open: false }));
    }
  }, [fetcher.data]);

  // Close modals on success
  useEffect(() => {
    if (fetcher.data?.success) {
      setPasswordModal((prev: { open: boolean; userId: string; userName: string }) => ({ ...prev, open: false }));
      setEmailModal((prev: { open: boolean; userId: string; currentEmail: string }) => ({ ...prev, open: false }));
      setNewPassword("");
      setNewEmail("");
      setDetailModal(prev => ({ ...prev, open: false }));
      setDeleteModal({ open: false, user: null });
    }
  }, [fetcher.data]);

  const handleViewUser = (user: AdminUsersLoaderData['users'][number]) => {
    setDetailModal({ open: true, user, mode: "view" });
  };

  const handleEditUser = (user: AdminUsersLoaderData['users'][number]) => {
    setDetailModal({ open: true, user, mode: "edit" });
  };

  const handleResetPassword = (userId: string, userName: string) => {
    setPasswordModal({ open: true, userId, userName });
    setNewPassword("");
  };

  const handleChangeEmail = (userId: string, currentEmail: string) => {
    setEmailModal({ open: true, userId, currentEmail });
    setNewEmail(currentEmail);
  };

  const submitPasswordChange = () => {
    if (newPassword.length < 4) return;
    fetcher.submit(
      { intent: "change-password", userId: passwordModal.userId, password: newPassword },
      { method: "post" }
    );
  };

  const submitEmailChange = () => {
    if (!newEmail.includes("@")) return;
    fetcher.submit(
      { intent: "change-email", userId: emailModal.userId, email: newEmail },
      { method: "post" }
    );
  };

  const handleImageError = (userId: string) => {
    setImageErrors((prev) => new Set(prev).add(userId));
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 border border-green-200 text-[10px] font-medium bg-green-50 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            활성
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2 py-0.5 border border-gray-200 text-[10px] font-medium bg-gray-50 text-gray-700">
            <XCircle className="w-3 h-3 mr-1" />
            비활성
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center px-2 py-0.5 border border-red-200 text-[10px] font-medium bg-red-50 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            정지
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      관리자: {
        label: "관리자",
        color: "bg-purple-100 text-purple-800",
        icon: Shield,
      },
      판매자: {
        label: "판매자",
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
      },
      "일반 사용자": {
        label: "일반 사용자",
        color: "bg-gray-100 text-gray-800",
        icon: CheckCircle,
      },
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    const IconComponent = config?.icon || CheckCircle;
    const color = config?.color || "bg-gray-100 text-gray-800";
    const label = role; // Use the actual role name

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 border border-gray-200 text-[10px] font-medium ${color.replace("text-", "border-").replace("800", "200")} ${color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {label}
      </span>
    );
  };
  return (
    <div className="bg-white border border-gray-200">
      {/* Feedback Message */}
      {fetcher.data?.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {fetcher.data.message}
        </div>
      )}
      {fetcher.data?.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {fetcher.data.error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <Checkbox 
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onCheckedChange={(checked) => onToggleAll(!!checked)}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                닉네임 / 성명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일 / 아이디
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                역할
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                동문 매칭
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가입 / 승인일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                최근 활동 / 수정
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    사용자 목록을 불러오는 중...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 max-w-md mx-auto">
                    <p>{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers()}
                      className="mt-3"
                    >
                      다시 시도
                    </Button>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm || (filterRole && filterRole !== "all") || filterStatus !== "all"
                    ? "검색 조건에 맞는 사용자가 없습니다."
                    : "등록된 사용자가 없습니다."}
                </td>
              </tr>
            ) : (
              users.map((user: UserTableProps['users'][number]) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => onToggleUser(user.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {user.profile_image && !imageErrors.has(user.id) ? (
                        <img 
                          src={user.profile_image} 
                          alt={user.name} 
                          className="w-10 h-10 border border-gray-200 object-cover"
                          onError={() => {
                            const newErrors = new Set(imageErrors);
                            newErrors.add(user.id);
                            setImageErrors(newErrors);
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-400">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.nickname}</div>
                        <div className="text-[10px] text-gray-500">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      {user.email && (
                        <div className="flex items-center gap-1 group">
                          <span className="text-sm text-gray-900 font-medium">{user.email}</span>
                          {user.emailConfirmedAt ? (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded opacity-70 group-hover:opacity-100 transition-opacity" title={`인증: ${new Date(user.emailConfirmedAt).toLocaleString("ko-KR")}`}>인증</span>
                          ) : (
                            <span className="text-[10px] bg-gray-50 text-gray-400 px-1 rounded">미인증</span>
                          )}
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-1 group">
                          <span className="text-xs text-gray-500">{user.phone}</span>
                          {user.phoneConfirmedAt ? (
                            <span className="text-[10px] bg-green-50 text-green-600 px-1 rounded opacity-70 group-hover:opacity-100 transition-opacity" title={`인증: ${new Date(user.phoneConfirmedAt).toLocaleString("ko-KR")}`}>인증</span>
                          ) : (
                            <span className="text-[10px] bg-gray-50 text-gray-400 px-1 rounded">미인증</span>
                          )}
                        </div>
                      )}
                      <div className="text-xs font-mono text-gray-400 mt-1">ID: {user.identifier}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <div key={role.id}>{getRoleBadge(role.display_name)}</div>
                        ))
                      ) : (
                        getRoleBadge("일반 사용자")
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.bxmember ? (
                      <div className="flex flex-col text-xs space-y-0.5">
                        <div className="flex items-center text-green-700 font-bold">
                          <CheckCircle className="w-3 h-3 mr-1" /> 매칭됨
                        </div>
                        <div className="text-gray-500">
                          {user.bxmember.name_kor} ({user.bxmember.graduate_year}졸)
                        </div>
                        <button 
                          onClick={() => setMatchModal({ open: true, user })}
                          className="text-blue-600 hover:text-blue-800 underline text-[10px] text-left"
                        >
                          변경하기
                        </button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs px-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600"
                        onClick={() => setMatchModal({ open: true, user })}
                      >
                        <GraduationCap className="w-3 h-3 mr-1" /> 매칭하기
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <div className="flex flex-col gap-1">
                      <div title="가입일">가입: {user.joinDate ? new Date(user.joinDate).toLocaleDateString("ko-KR") : "-"}</div>
                      {user.confirmedAt && (
                        <div className="text-blue-600" title="계정 승인일">승인: {new Date(user.confirmedAt).toLocaleDateString("ko-KR")}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <div className="flex flex-col gap-1">
                      <div title="마지막 로그인">로그인: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("ko-KR") : "-"}</div>
                      {user.updatedAt && (
                        <div className="text-gray-400" title="정보 수정일">수정: {new Date(user.updatedAt).toLocaleDateString("ko-KR")}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="비밀번호 변경"
                        onClick={() => handleResetPassword(user.id, user.name)}
                        className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                      >
                        <LockIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="이메일 변경"
                        onClick={() => handleChangeEmail(user.id, user.email)}
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <div className="w-px h-4 bg-gray-200 mx-1" />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="상세 보기"
                        onClick={() => handleViewUser(user)}
                        className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="정보 수정"
                        onClick={() => handleEditUser(user)}
                        className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="사용자 삭제"
                        onClick={() => setDeleteModal({ open: true, user })}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Password Change Modal */}
      <Dialog open={passwordModal.open} onOpenChange={(open) => setPasswordModal((curr: { open: boolean; userId: string; userName: string }) => ({ ...curr, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{passwordModal.userName}님의 비밀번호 변경</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-password">새 비밀번호</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="최소 4자 이상"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2"
            />
            {newPassword && newPassword.length < 4 && (
              <p className="text-xs text-red-500 mt-1">비밀번호는 최소 4자 이상이어야 합니다.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordModal((curr: { open: boolean; userId: string; userName: string }) => ({ ...curr, open: false }))}>취소</Button>
            <Button 
              disabled={newPassword.length < 4 || fetcher.state !== "idle"} 
              onClick={submitPasswordChange}
            >
              {fetcher.state !== "idle" ? "저장 중..." : "변경하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Change Modal */}
      <Dialog open={emailModal.open} onOpenChange={(open) => setEmailModal((curr: { open: boolean; userId: string; currentEmail: string }) => ({ ...curr, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이메일 주소 변경</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-email">새 이메일 주소</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-2"
            />
            {newEmail && !newEmail.includes("@") && (
              <p className="text-xs text-red-500 mt-1">유효한 이메일 형식이 아닙니다.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModal((curr: { open: boolean; userId: string; currentEmail: string }) => ({ ...curr, open: false }))}>취소</Button>
            <Button 
              disabled={!newEmail.includes("@") || newEmail === emailModal.currentEmail || fetcher.state !== "idle"} 
              onClick={submitEmailChange}
            >
              {fetcher.state !== "idle" ? "저장 중..." : "변경하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Modal */}
      <Dialog open={detailModal.open} onOpenChange={(open) => setDetailModal(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailModal.mode === "view" ? "사용자 상세 정보" : "사용자 정보 수정"}
              {detailModal.user && (
                <span className="text-sm font-normal text-gray-500">
                  {detailModal.user.name} ({detailModal.user.email})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {detailModal.user && (
            <UserDetailForm 
              user={detailModal.user} 
              mode={detailModal.mode} 
              onClose={() => setDetailModal(prev => ({ ...prev, open: false }))}
              fetcher={fetcher}
              allRoles={(useLoaderData() as AdminUsersLoaderData).allRoles}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}>
        {deleteModal.user && (
          <DeleteUserModal 
            user={deleteModal.user} 
            onClose={() => setDeleteModal({ open: false, user: null })}
            fetcher={fetcher}
          />
        )}
      </Dialog>
      
      {/* Match Alumni Modal */}
      <Dialog open={matchModal.open} onOpenChange={(open) => setMatchModal(curr => ({ ...curr, open }))}>
        <DialogContent className="sm:max-w-150 max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>동문 매칭 - {matchModal.user?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4 flex-1 overflow-y-auto pr-2">
            {/* Target User Info */}
            <div className="bg-gray-50 p-4 border border-gray-200 flex justify-between items-center">
              <div className="flex-1">
                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">대상 사용자 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">닉네임 / 성명</p>
                      <p className="text-sm font-medium">{matchModal.user?.nickname} / {matchModal.user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">이메일 / 아이디</p>
                      <p className="text-sm font-medium">{matchModal.user?.email || "-"} / {matchModal.user?.identifier}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="ml-4 h-9"
                onClick={() => matchModal.user && setDetailModal({ open: true, user: matchModal.user, mode: "view" })}
              >
                <Eye className="w-3 h-3 mr-1" /> 전체 프로필 보기
              </Button>
            </div>

            <div className="bg-blue-50 p-3 border border-blue-100 text-sm text-blue-800 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">매칭 가이드</p>
                <p>시스템 사용자를 기존 동문 명부(`bxmember`)와 연결합니다. 매칭 시 해당 사용자에게 <span className="font-bold underline">"동문회원" 역할이 자동으로 부여</span>됩니다.</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <div className="space-y-1">
                <Label htmlFor="search-name" className="text-[10px]">이름</Label>
                <Input 
                  id="search-name"
                  value={alumniSearch.query.name}
                  onChange={(e) => setAlumniSearch(prev => ({ ...prev, query: { ...prev.query, name: e.target.value } }))}
                  placeholder="이름"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="search-phone" className="text-[10px]">연락처</Label>
                <Input 
                  id="search-phone"
                  value={alumniSearch.query.phone}
                  onChange={(e) => setAlumniSearch(prev => ({ ...prev, query: { ...prev.query, phone: e.target.value } }))}
                  placeholder="연락처"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="search-email" className="text-[10px]">이메일</Label>
                <Input 
                  id="search-email"
                  value={alumniSearch.query.email}
                  onChange={(e) => setAlumniSearch(prev => ({ ...prev, query: { ...prev.query, email: e.target.value } }))}
                  placeholder="이메일"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="search-year" className="text-[10px]">기수/년도</Label>
                <Input 
                  id="search-year"
                  value={alumniSearch.query.year}
                  onChange={(e) => setAlumniSearch(prev => ({ ...prev, query: { ...prev.query, year: e.target.value } }))}
                  placeholder="2024"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1 flex items-end">
                <Button 
                  onClick={() => handleSearchAlumni(alumniSearch.query)}
                  className="w-full h-8"
                  size="sm"
                  disabled={alumniSearch.loading}
                >
                  <Search className="w-3 h-3 mr-1" /> 검색
                </Button>
              </div>
            </div>

            <div className="border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">이름</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">전공/학과</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">졸업년도</th>
                    <th className="px-3 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {alumniSearch.loading ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                        검색 중...
                      </td>
                    </tr>
                  ) : alumniSearch.results.length > 0 ? (
                    alumniSearch.results.map((alumni) => (
                      <tr key={alumni.seq} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-900">{alumni.name_kor}</div>
                          <div className="text-[10px] text-gray-400">{alumni.email || alumni.cellphone_number || "-"}</div>
                        </td>
                        <td className="px-3 py-2 text-gray-600">{alumni.major || "-"}</td>
                        <td className="px-3 py-2 text-gray-600">{alumni.graduate_year}년</td>
                        <td className="px-3 py-2 text-right">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleMatchAlumni(alumni.seq)}
                            disabled={fetcher.state !== "idle" || (matchModal.user?.bxmember?.seq === alumni.seq) || !!(alumni.user_id && alumni.user_id !== matchModal.user?.id)}
                          >
                            {matchModal.user?.bxmember?.seq === alumni.seq ? "현재 매칭됨" : alumni.user_id ? "다른 사용자 매칭" : "매칭선택"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <DialogFooter className="mt-4 pt-4 border-t flex justify-between items-center">
            <div>
              {matchModal.user?.bxmember && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setUnmatchConfirmOpen(true)}
                  disabled={fetcher.state !== "idle"}
                >
                  매칭 해제하기
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setMatchModal(curr => ({ ...curr, open: false }))}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unmatch Confirmation Modal */}
      <Dialog open={unmatchConfirmOpen} onOpenChange={setUnmatchConfirmOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" /> 동문 매칭 해제
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-red-50 p-3 border border-red-100 text-sm text-red-800">
              <p>이 사용자의 동문 매칭을 해제하시겠습니까? 해제 시 <span className="font-bold">"동문회원" 역할이 비활성화</span>됩니다.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">계속하려면 아래에 <span className="font-bold text-gray-900">매칭해제</span>를 입력하세요.</Label>
              <Input 
                value={unmatchConfirmText}
                onChange={(e) => setUnmatchConfirmText(e.target.value)}
                placeholder="매칭해제"
                className="h-9"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUnmatchConfirmOpen(false);
              setUnmatchConfirmText("");
            }}>취소</Button>
            <Button 
              variant="destructive" 
              onClick={handleUnmatchAlumni}
              disabled={unmatchConfirmText !== "매칭해제" || fetcher.state !== "idle"}
            >
              해제 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeleteUserModal({ 
  user, 
  onClose,
  fetcher
}: { 
  user: AdminUsersLoaderData['users'][number]; 
  onClose: () => void;
  fetcher: ReturnType<typeof useFetcher<UserActionData>>;
}) {
  const [isHardDelete, setIsHardDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  
  const softConfirm = "삭제";
  const hardConfirm = "완전삭제";
  
  const isConfirmed = isHardDelete 
    ? (confirmText === hardConfirm || confirmText === user.name)
    : (confirmText === softConfirm || confirmText === user.name);

  const handleDelete = () => {
    if (!isConfirmed) return;
    fetcher.submit(
      { 
        intent: isHardDelete ? "hard-delete-user" : "delete-user", 
        userId: user.id 
      },
      { method: "post" }
    );
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className={`${isHardDelete ? "text-red-700" : "text-red-500"} flex items-center gap-2`}>
          <Trash2 className="w-5 h-5" /> 사용자 {isHardDelete ? "영구" : ""} 삭제 확인
        </DialogTitle>
      </DialogHeader>

      <div className="py-2 space-y-4">
        {/* Deletion Type Toggle */}
        <div className="flex p-1 bg-gray-100 border border-gray-200">
          <button 
            type="button"
            className={`flex-1 py-1.5 text-xs font-medium transition-all ${!isHardDelete ? "bg-white text-gray-900 border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => { setIsHardDelete(false); setConfirmText(""); }}
          >
            소프트 삭제
          </button>
          <button 
            type="button"
            className={`flex-1 py-1.5 text-xs font-medium transition-all ${isHardDelete ? "bg-red-50 text-red-700 border border-red-200" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => { setIsHardDelete(true); setConfirmText(""); }}
          >
            완전 삭제
          </button>
        </div>

        <div className={`p-4 text-sm border ${isHardDelete ? "bg-red-50 border-red-100 text-red-900" : "bg-orange-50 border-orange-100 text-orange-900"}`}>
          <p className="font-semibold mb-1">
            {isHardDelete ? "⚠️ 경고: 영구적으로 삭제하시겠습니까?" : "주의: 사용자를 비활성화하시겠습니까?"}
          </p>
          <p className="leading-relaxed opacity-90">
            {isHardDelete 
              ? `사용자 ${user.name} (${user.email})의 모든 정보가 DB와 Supabase Auth에서 영구적으로 제거됩니다.`
              : `사용자 ${user.name} (${user.email})의 계정을 비활성화하여 로그인을 차단합니다.`}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="delete-confirm" className="text-sm font-medium">
            확인을 위해 <span className="font-bold text-red-600">"{isHardDelete ? hardConfirm : softConfirm}"</span> 또는 <span className="font-bold text-red-600">"{user.name}"</span>을(를) 입력해 주세요.
          </Label>
          <Input 
            id="delete-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={isHardDelete ? "완전삭제" : "삭제"}
            className={`w-full ${isHardDelete ? "border-red-300 focus-visible:ring-red-500" : ""}`}
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onClose} disabled={fetcher.state !== "idle"}>취소</Button>
        <Button 
          variant="destructive"
          disabled={!isConfirmed || fetcher.state !== "idle"}
          onClick={handleDelete}
          className={isHardDelete ? "bg-red-600 hover:bg-red-700" : ""}
        >
          {fetcher.state !== "idle" ? "삭제 중..." : (isHardDelete ? "영구 삭제 실행" : "비활성화 완료")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function UserDetailForm({ 
  user, 
  mode, 
  onClose,
  fetcher,
  allRoles
}: { 
  user: AdminUsersLoaderData['users'][number]; 
  mode: "view" | "edit";
  onClose: () => void;
  fetcher: ReturnType<typeof useFetcher<UserActionData>>;
  allRoles: AdminUsersLoaderData['allRoles'];
}) {
  const profile = (user.profile || {}) as NonNullable<typeof user.profile> & Record<string, unknown>;
  const extraVars = (profile.extra_vars || {}) as Record<string, string | undefined>;
  
  const [formData, setFormData] = useState({
    display_name: profile.display_name || user.name || "",
    allow_mailing: profile.allow_mailing ? "Y" : "N",
    allow_message: profile.allow_message ? "Y" : "N",
  });

  const [localExtraVars, setLocalExtraVars] = useState<Record<string, string | undefined>>({ ...extraVars });
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(user.roles.map(r => r.id));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name in formData) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setLocalExtraVars(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked ? "Y" : "N" }));
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoleIds(prev => [...prev, roleId]);
    } else {
      setSelectedRoleIds(prev => prev.filter(id => id !== roleId));
    }
  };

  const handleSubmit = () => {
    fetcher.submit(
      { 
        intent: "update-user-profile", 
        userId: user.id, 
        profileData: JSON.stringify(formData),
        extraVars: JSON.stringify(localExtraVars),
        roles: JSON.stringify(selectedRoleIds)
      },
      { method: "post" }
    );
  };

  const isView = mode === "view";
  const inputBaseClass = "w-full border rounded-md px-3 py-2 text-sm";
  const labelClass = "text-sm font-medium text-gray-700";

  const renderField = (label: string, name: string, defaultValue: string = "", type: string = "text", options?: { label: string, value: string }[]) => (
    <div className="space-y-1">
      <Label className={labelClass}>{label}</Label>
      {isView ? (
        <div className="px-3 py-2 bg-gray-50 border text-sm min-h-10">
          {options ? options.find(o => o.value === (localExtraVars[name] || defaultValue))?.label || localExtraVars[name] || defaultValue || "-" : localExtraVars[name] || defaultValue || "-"}
        </div>
      ) : options ? (
        <Select 
          value={localExtraVars[name] || defaultValue} 
          onValueChange={(val) => setLocalExtraVars(prev => ({ ...prev, [name]: val }))}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder=":: 선택 ::" />
          </SelectTrigger>
          <SelectContent>
            {options.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          name={name}
          type={type}
          defaultValue={localExtraVars[name] || defaultValue}
          onChange={handleInputChange}
          className="w-full h-10"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 py-4">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="account" className="flex items-center gap-1.5"><Info className="w-4 h-4" />계정</TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-1.5"><UserIcon className="w-4 h-4" />개인</TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />학력</TabsTrigger>
          <TabsTrigger value="office" className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />직장</TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5"><Settings className="w-4 h-4" />설정</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className={labelClass}>이메일</Label>
                <div className="px-3 py-2 bg-gray-100 border text-sm">{user.email || "-"}</div>
              </div>
              <div className="space-y-1">
                <Label className={labelClass}>닉네임</Label>
                {isView ? (
                  <div className="px-3 py-2 bg-gray-50 border text-sm">{formData.display_name}</div>
                ) : (
                  <Input 
                    name="display_name" 
                    value={formData.display_name} 
                    onChange={handleInputChange} 
                  />
                )}
              </div>
              <div className="space-y-1">
                <Label className={labelClass}>아이디 (Identifier)</Label>
                <div className="px-3 py-2 bg-gray-100 border text-sm font-mono">{user.identifier}</div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-1 flex items-center gap-2">
                <Shield className="w-4 h-4" /> 역할 부여
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {allRoles.map(role => (
                  <div key={role.id} className="flex items-center gap-3">
                    {isView ? (
                      <div className={`w-4 h-4 border flex items-center justify-center ${selectedRoleIds.includes(role.id) ? "bg-purple-600 border-purple-600" : "bg-white border-gray-300"}`}>
                        {selectedRoleIds.includes(role.id) && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    ) : (
                      <Checkbox 
                        id={`role-${role.id}`} 
                        checked={selectedRoleIds.includes(role.id)} 
                        onCheckedChange={(checked) => handleRoleToggle(role.id, !!checked)}
                      />
                    )}
                    <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer font-normal">{role.display_name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderField("이름", "user_name")}
              {renderField("성별", "sex", "", "select", [{ label: "남성", value: "남" }, { label: "여성", value: "여" }])}
              {renderField("휴대폰 번호", "cellphone_number")}
              {renderField("자택 전화번호", "phone_number")}
              <div className="col-span-2">
                {renderField("자택 주소", "address")}
              </div>
            </div>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-6">
            <div className="space-y-4 pb-4 border-b">
              <h4 className="font-semibold text-gray-900">학사</h4>
              <div className="grid grid-cols-3 gap-4">
                {renderField("입학 년도", "enter_year")}
                <div className="col-span-2">
                  {renderField("졸업 학과", "major", "", "select", [
                    { label: "경성공업전문학교(전기)", value: "경성공업전문학교(전기)" },
                    { label: "경성공업전문학교(후기)", value: "경성공업전문학교(후기)" },
                    { label: "경성고등공업학교", value: "경성고등공업학교" },
                    { label: "경성대학이공학부", value: "경성대학이공학부" },
                    { label: "공과대학전문부", value: "공과대학전문부" },
                    { label: "화학공학과", value: "화학공학과" },
                    { label: "응용화학과", value: "응용화학과" },
                    { label: "공업화학과", value: "공업화학과" },
                    { label: "응용화학부", value: "응용화학부" },
                    { label: "화학생물공학부", value: "화학생물공학부" },
                  ])}
                </div>
                {renderField("졸업 년도", "graduate_year")}
                {renderField("졸업 월", "graduate_month", "", "select", [{ label: "2월", value: "2" }, { label: "8월", value: "8" }])}
                {renderField("졸업 기수", "graduate_number")}
              </div>
            </div>
            <div className="space-y-4 pb-4 border-b">
              <h4 className="font-semibold text-gray-900">석사</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3">
                  {renderField("전공", "master_major", "", "select", [
                    { label: "화학공학과", value: "화학공학과" },
                    { label: "공업화학과", value: "공업화학과" },
                    { label: "응용화학부", value: "응용화학부" },
                    { label: "화학생물공학부", value: "화학생물공학부" },
                  ])}
                </div>
                {renderField("졸업 년도", "master_graduate_year")}
                {renderField("졸업 월", "master_graduate_month", "", "select", [{ label: "2월", value: "2" }, { label: "8월", value: "8" }])}
                {renderField("졸업 기수", "master_graduate_number")}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">박사</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3">
                  {renderField("전공", "doctor_major", "", "select", [
                    { label: "화학공학과(구)", value: "화학공학과(구)" },
                    { label: "화학공학과", value: "화학공학과" },
                    { label: "공업화학과", value: "공업화학과" },
                    { label: "응용화학부", value: "응용화학부" },
                    { label: "응용화학과", value: "응용화학과" },
                    { label: "화학생물공학부", value: "화학생물공학부" },
                  ])}
                </div>
                {renderField("졸업 년도", "doctor_graduate_year")}
                {renderField("졸업 월", "doctor_graduate_month", "", "select", [{ label: "2월", value: "2" }, { label: "8월", value: "8" }])}
                {renderField("졸업 기수", "doctor_graduate_number")}
              </div>
            </div>
          </TabsContent>

          {/* Office Tab */}
          <TabsContent value="office" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderField("직장명", "office_name")}
              {renderField("직위", "office_position")}
              {renderField("직종", "job_class")}
              {renderField("직장 지역", "office_area")}
              {renderField("직장 전화번호", "office_phone_number")}
              {renderField("경력 사항", "office_career")}
              <div className="col-span-2">
                {renderField("직장 주소", "office_address")}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-1">정보 공개 설정</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "명부 검색 허용", name: "search_agree" },
                    { label: "휴대폰 번호 공개", name: "o_cellphone_number" },
                    { label: "이메일 주소 공개", name: "o_email_address" },
                    { label: "직장명 공개", name: "o_office_name" },
                    { label: "직위 공개", name: "o_office_position" },
                  ].map(f => (
                    <div key={f.name} className="flex items-center gap-3">
                      {isView ? (
                        <div className={`w-4 h-4 border flex items-center justify-center ${localExtraVars[f.name] === "Y" ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                          {localExtraVars[f.name] === "Y" && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      ) : (
                        <Checkbox 
                          id={f.name} 
                          checked={localExtraVars[f.name] === "Y"} 
                          onCheckedChange={(checked) => setLocalExtraVars(prev => ({ ...prev, [f.name]: checked ? "Y" : "N" }))}
                        />
                      )}
                      <Label htmlFor={f.name} className="text-sm cursor-pointer font-normal">{f.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-1">수신 동의 설정</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-3">
                    {isView ? (
                      <div className={`w-4 h-4 border flex items-center justify-center ${formData.allow_mailing === "Y" ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                        {formData.allow_mailing === "Y" && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    ) : (
                      <Checkbox 
                        id="allow_mailing" 
                        checked={formData.allow_mailing === "Y"} 
                        onCheckedChange={(checked) => handleCheckboxChange("allow_mailing", !!checked)}
                      />
                    )}
                    <Label htmlFor="allow_mailing" className="text-sm cursor-pointer font-normal">이메일 수신 동의</Label>
                  </div>
                   <div className="flex items-center gap-3">
                    {isView ? (
                      <div className={`w-4 h-4 border flex items-center justify-center ${formData.allow_message === "Y" ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                        {formData.allow_message === "Y" && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    ) : (
                      <Checkbox 
                        id="allow_message" 
                        checked={formData.allow_message === "Y"} 
                        onCheckedChange={(checked) => handleCheckboxChange("allow_message", !!checked)}
                      />
                    )}
                    <Label htmlFor="allow_message" className="text-sm cursor-pointer font-normal">쪽지 수신 동의</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <DialogFooter className="border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          {isView ? "닫기" : "취소"}
        </Button>
        {!isView && (
          <Button 
            onClick={handleSubmit}
            disabled={fetcher.state !== "idle"}
          >
            {fetcher.state !== "idle" ? "저장 중..." : "저장하기"}
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}
