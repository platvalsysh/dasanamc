import { useState, useEffect } from "react";
import { 
  type LoaderFunctionArgs, 
  type ActionFunctionArgs, 
  useFetcher, 
  useSearchParams, 
  useNavigate, 
  useLoaderData 
} from "react-router";
import { type Prisma, prisma } from "@repo/database";
import { useAuthServerContext } from "../../.server";
import { UserTable } from "./UserTable";
import { Search, Plus, ChevronDown, XCircle } from "lucide-react";
import { 
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@repo/ui-admin";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@repo/env/server";

import { getErrorMessage } from "@repo/core/utils";
const serverSupabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["auth.users.view", "auth.*"]);
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search") || "";
  const searchField = url.searchParams.get("searchField") || "all";
  const dateStart = url.searchParams.get("dateStart") || "";
  const dateEnd = url.searchParams.get("dateEnd") || "";
  const dateField = url.searchParams.get("dateField") || "created_at";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  // Build where clause
  const where: Prisma.usersWhereInput = {};

  if (searchTerm) {
    if (searchField === "all") {
      where.OR = [
        { email: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm, mode: "insensitive" } },
        { identifiers: { identifier: { contains: searchTerm, mode: "insensitive" } } },
        { profiles: { display_name: { contains: searchTerm, mode: "insensitive" } } },
        { profiles: { extra_vars: { path: ["user_name"], string_contains: searchTerm } } },
      ];
    } else if (searchField === "email") {
      where.email = { contains: searchTerm, mode: "insensitive" };
    } else if (searchField === "phone") {
      where.phone = { contains: searchTerm, mode: "insensitive" };
    } else if (searchField === "identifier") {
      where.identifiers = { identifier: { contains: searchTerm, mode: "insensitive" } };
    } else if (searchField === "nickname") {
      where.profiles = { display_name: { contains: searchTerm, mode: "insensitive" } };
    } else if (searchField === "name") {
      where.profiles = { extra_vars: { path: ["user_name"], string_contains: searchTerm } };
    }
  }

  // Role filtering
  const filterRoles = url.searchParams.get("roles")?.split(",").filter(Boolean) || [];
  
  if (filterRoles.length > 0 && !filterRoles.includes("all")) {
    const roleNames = filterRoles.filter((r) => r !== "none");
    const hasNone = filterRoles.includes("none");

    const roleConditions = [];
    if (roleNames.length > 0) {
      roleConditions.push({
        admin_user_roles_admin_user_roles_user_idTousers: {
          some: {
            is_active: true,
            admin_roles: {
              name: { in: roleNames },
            },
          },
        },
      });
    }

    if (hasNone) {
      roleConditions.push({
        admin_user_roles_admin_user_roles_user_idTousers: {
          none: {
            is_active: true,
          },
        },
      });
    }

    if (roleConditions.length > 1) {
      where.OR = roleConditions;
    } else if (roleConditions.length === 1) {
      // Merge condition if OR is not already used, but searchTerm uses OR.
      // So we must use AND to combine searchTerm's OR and role's OR.
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          roleConditions[0]
        ];
        delete where.OR;
      } else {
        Object.assign(where, roleConditions[0]);
      }
    }
  }

  // Status filtering
  const filterStatuses = url.searchParams.get("statuses")?.split(",").filter(Boolean) || [];
  if (filterStatuses.length > 0 && !filterStatuses.includes("all")) {
    const statusConditions = [];
    
    if (filterStatuses.includes("active")) {
      statusConditions.push({
        banned_until: null,
        deleted_at: null,
      });
    }
    
    if (filterStatuses.includes("suspended")) {
      statusConditions.push({
        banned_until: { gt: new Date() },
      });
    }
    
    if (filterStatuses.includes("inactive")) {
      statusConditions.push({
        deleted_at: { not: null },
      });
    }

    if (statusConditions.length > 0) {
      if (statusConditions.length === 1) {
        where.AND = [
          ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
          statusConditions[0]
        ];
      } else {
        where.AND = [
          ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
          { OR: statusConditions }
        ];
      }
    }
  }

  // Date range filtering
  if (dateStart || dateEnd) {
    const dateQuery: { gte?: Date; lte?: Date } = {};
    if (dateStart) dateQuery.gte = new Date(dateStart);
    if (dateEnd) {
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59, 999);
      dateQuery.lte = end;
    }

    if (Object.keys(dateQuery).length > 0) {
      const field = ["created_at", "last_sign_in_at", "updated_at", "confirmed_at"].includes(dateField) 
        ? dateField 
        : "created_at";
      
      const dateCondition = { [field]: dateQuery };
      
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        dateCondition
      ];
    }
  }

  const [users, totalCount, allRoles] = await Promise.all([
    prisma.users.findMany({
      skip,
      take: itemsPerPage,
      select: {
        id: true,
        email: true,
        phone: true,
        created_at: true,
        last_sign_in_at: true,
        banned_until: true,
        deleted_at: true,
        email_confirmed_at: true,
        phone_confirmed_at: true,
        updated_at: true,
        confirmed_at: true,
        identifiers: {
          select: {
            identifier: true,
          },
        },
        profiles: true,
        admin_user_roles_admin_user_roles_user_idTousers: {
          where: { is_active: true },
          select: {
            role_id: true,
            admin_roles: {
              select: {
                id: true,
                name: true,
                display_name: true,
              },
            },
          },
        },
      },
      where,
      orderBy: { created_at: "desc" },
    }),
    prisma.users.count({ where }),
    prisma.admin_roles.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        display_name: true,
      },
      orderBy: { level: "asc" },
    }),
  ]);

  // Transform data to match User interface
  const formattedUsers = users.map((user) => {
    const assignedRoles = user.admin_user_roles_admin_user_roles_user_idTousers.map(
      (r) => ({
        id: r.role_id,
        name: r.admin_roles.name,
        display_name: r.admin_roles.display_name
      })
    );

    const name = (user.profiles?.extra_vars as Record<string, unknown> | null)?.user_name as string || "";
    const nickname = user.profiles?.display_name || "";
    const profile_image = user.profiles?.profile_image;
    const identifier = user.identifiers?.identifier || "";

    let status = "active";
    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      status = "suspended";
    } else if (user.deleted_at) {
      status = "inactive";
    }

    return {
      id: user.id,
      identifier,
      name,
      nickname,
      email: user.email || "",
      phone: user.phone || "",
      roles: assignedRoles,
      status,
      joinDate: user.created_at ? user.created_at.toISOString() : null,
      lastLogin: user.last_sign_in_at ? user.last_sign_in_at.toISOString() : null,
      emailConfirmedAt: user.email_confirmed_at ? user.email_confirmed_at.toISOString() : null,
      phoneConfirmedAt: user.phone_confirmed_at ? user.phone_confirmed_at.toISOString() : null,
      updatedAt: user.updated_at ? user.updated_at.toISOString() : null,
      confirmedAt: user.confirmed_at ? user.confirmed_at.toISOString() : null,
      profile_image,
      profile: user.profiles,
    };
  });

  return { users: formattedUsers, totalCount, page, itemsPerPage, allRoles };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = formData.get("userId") as string;

  if (intent === "change-password") {
    auth.requirePermissions(["auth.users.edit", "auth.*"]);
    const newPassword = formData.get("password") as string;
    if (!newPassword || newPassword.length < 4) {
      return { error: "비밀번호는 최소 4자 이상이어야 합니다." };
    }
    // Supabase Auth Admin API 사용 (audit M3). Prisma 로 auth.users.encrypted_password
    // 를 직접 쓰면 Supabase 가 기대하는 해시 포맷/메타 갱신을 우회해 다음 로그인
    // 부터 인증 실패할 수 있음.
    const { error } = await serverSupabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) {
      return { error: "비밀번호 변경 실패: " + error.message };
    }
    return { success: true, message: "비밀번호가 성공적으로 변경되었습니다." };
  }

  if (intent === "change-email") {
    auth.requirePermissions(["auth.users.edit", "auth.*"]);
    const newEmail = formData.get("email") as string;
    if (!newEmail || !newEmail.includes("@")) {
      return { error: "유효한 이메일 주소를 입력해주세요." };
    }
    // Supabase Auth Admin API 사용 (audit M3). Prisma 로 auth.users.email 만
    // 바꾸면 Supabase 의 email_change/confirmation 컬럼이 어긋나 로그인이
    // 막힐 수 있음. email_confirm:true 로 즉시 확정 (관리자 변경이므로).
    const { error } = await serverSupabase.auth.admin.updateUserById(userId, {
      email: newEmail,
      email_confirm: true,
    });
    if (error) {
      // 흔한 케이스: 이미 다른 계정이 쓰는 이메일
      if (error.message.toLowerCase().includes("already")) {
        return { error: "이미 사용 중인 이메일입니다." };
      }
      return { error: "이메일 변경 실패: " + error.message };
    }
    return { success: true, message: "이메일이 성공적으로 변경되었습니다." };
  }

  if (intent === "create-user") {
    auth.requirePermissions(["auth.users.create", "auth.*"]);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const nickname = formData.get("nickname") as string;
    const allowMailing = formData.get("allowMailing") === "true";
    const allowMessage = formData.get("allowMessage") === "true";

    if (!email || !email.includes("@")) return { error: "유효한 이메일을 입력해주세요." };
    if (!password || password.length < 4) return { error: "비밀번호는 최소 4자 이상이어야 합니다." };
    if (!nickname) return { error: "닉네임을 입력해주세요." };

    try {
      // Create user via Supabase Admin API
      const { data: authUser, error: authError } = await serverSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: nickname,
        }
      });

      if (authError) throw authError;

      const userId = authUser.user.id;

      await prisma.profiles.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          display_name: nickname,
          allow_mailing: allowMailing,
          allow_message: allowMessage,
          extra_vars: {},
        },
        update: {
          display_name: nickname,
          allow_mailing: allowMailing,
          allow_message: allowMessage,
          extra_vars: {},
        },
      });

      return { success: true, message: "새 사용자가 성공적으로 생성되었습니다." };
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        return { error: "이미 존재하는 이메일입니다." };
      }
      return { error: "사용자 생성 중 오류가 발생했습니다: " + getErrorMessage(e) };
    }
  }

  if (intent === "update-user-profile") {
    auth.requirePermissions(["auth.users.edit", "auth.*"]);
    const profileData = JSON.parse(formData.get("profileData") as string);
    const extraVars = JSON.parse(formData.get("extraVars") as string);
    const roles = formData.get("roles") ? JSON.parse(formData.get("roles") as string) : null;

    // Ensure consistency flags
    extraVars.is_major = extraVars.major ? "Y" : "N";
    extraVars.is_master = extraVars.master_major ? "Y" : "N";
    extraVars.is_doctor = extraVars.doctor_major ? "Y" : "N";

    try {
      await prisma.$transaction(async (tx) => {
        // Update profile
        await tx.profiles.update({
          where: { user_id: userId },
          data: {
            display_name: profileData.display_name,
            allow_mailing: profileData.allow_mailing === "Y" || profileData.allow_mailing === true,
            allow_message: profileData.allow_message === "Y" || profileData.allow_message === true,
            extra_vars: extraVars,
          },
        });

        // Update roles if provided
        if (roles && Array.isArray(roles)) {
          // Deactivate old roles
          await tx.admin_user_roles.updateMany({
            where: { user_id: userId, is_active: true },
            data: { is_active: false },
          });

          // Activate/Create new roles
          for (const roleId of roles) {
            await tx.admin_user_roles.upsert({
              where: {
                user_id_role_id: {
                  user_id: userId,
                  role_id: roleId,
                },
              },
              create: {
                user_id: userId,
                role_id: roleId,
                is_active: true,
              },
              update: {
                is_active: true,
              },
            });
          }
        }
      });

      return { success: true, message: "사용자 정보 및 권한이 성공적으로 업데이트되었습니다." };
    } catch (e) {
      return { error: "정보 업데이트 중 오류가 발생했습니다: " + getErrorMessage(e) };
    }
  }

  if (intent === "delete-user") {
    auth.requirePermissions(["auth.users.delete", "auth.*"]);
    try {
      await prisma.users.update({
        where: { id: userId },
        data: { 
          deleted_at: new Date(),
        },
      });
      return { success: true, message: "사용자가 성공적으로 삭제(비활성화)되었습니다." };
    } catch (e) {
      return { error: "사용자 삭제 중 오류가 발생했습니다: " + getErrorMessage(e) };
    }
  }

  if (intent === "hard-delete-user") {
    // 영구 삭제는 최고관리자만 가능 (audit 위험도 가장 높음)
    auth.requireSuperAdmin();
    try {
      // 1. Delete from Supabase Auth first to be safe
      const { error: deleteAuthError } = await serverSupabase.auth.admin.deleteUser(userId as string);
      if (deleteAuthError && !deleteAuthError.message.includes("User not found")) {
        throw new Error("Supabase Auth 삭제 실패: " + deleteAuthError.message);
      }

      // 2. Delete from local Prisma (Transcation)
      await prisma.$transaction(async (tx) => {
        // Use deleteMany to avoid "record not found" errors if Supabase deletion already cleared them via cascade
        await tx.profiles.deleteMany({ where: { user_id: userId } });
        await tx.admin_user_roles.deleteMany({ where: { user_id: userId } });
        await tx.identifiers.deleteMany({ where: { user_id: userId } });
        await tx.users.deleteMany({ where: { id: userId } });
      });

      return { success: true, message: "사용자가 시스템에서 완전히 삭제되었습니다." };
    } catch (e) {
      return { error: "영구 삭제 중 오류가 발생했습니다: " + getErrorMessage(e) };
    }
  }

  return { error: "알 수 없는 작업입니다." };
}

export type AdminUsersLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;

function MultiSelect({ 
  label, 
  options, 
  selectedValues, 
  onToggle, 
  placeholder 
}: { 
  label: string;
  options: { label: string; value: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[150px] font-normal h-9">
          <span className="text-gray-700 font-medium mr-2">{label}:</span>
          <span className="flex-1 text-left truncate text-gray-600">
            {selectedValues.length === 0 
              ? placeholder 
              : `${selectedValues.length}개 선택됨`}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors">
            <Checkbox
              checked={selectedValues.length === 0}
              onCheckedChange={() => onToggle("all")}
            />
            <span className="text-sm">전체</span>
          </label>
          <div className="h-px bg-gray-100 my-1" />
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors">
              <Checkbox
                checked={selectedValues.includes(opt.value)}
                onCheckedChange={() => onToggle(opt.value)}
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function AdminUsers() {
  const { users, totalCount, page, itemsPerPage, allRoles } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [searchField, setSearchField] = useState(searchParams.get("searchField") || "all");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(searchParams.get("roles")?.split(",").filter(Boolean) || []);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(searchParams.get("statuses")?.split(",").filter(Boolean) || []);
  const [dateRange, setDateRange] = useState({
    start: searchParams.get("dateStart") || "",
    end: searchParams.get("dateEnd") || "",
    field: searchParams.get("dateField") || "created_at",
  });
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Create User Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: "",
    password: "",
    nickname: "",
    allowMailing: true,
    allowMessage: true,
  });

  const pageFetcher = useFetcher<{ success?: boolean; error?: string; message?: string }>();

  // Handle success feedback and modal close
  useEffect(() => {
    if (pageFetcher.data?.success) {
      setIsCreateModalOpen(false);
      setCreateFormData({ 
        email: "", 
        password: "", 
        nickname: "", 
        allowMailing: true, 
        allowMessage: true 
      });
    }
  }, [pageFetcher.data]);

  // Update local state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSearchField(searchParams.get("searchField") || "all");
    setSelectedRoles(searchParams.get("roles")?.split(",").filter(Boolean) || []);
    setSelectedStatuses(searchParams.get("statuses")?.split(",").filter(Boolean) || []);
    setDateRange({
      start: searchParams.get("dateStart") || "",
      end: searchParams.get("dateEnd") || "",
      field: searchParams.get("dateField") || "created_at",
    });
  }, [searchParams]);

  const executeSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");

    params.set("searchField", searchField);

    if (dateRange.start) params.set("dateStart", dateRange.start);
    else params.delete("dateStart");
    
    if (dateRange.end) params.set("dateEnd", dateRange.end);
    else params.delete("dateEnd");
    
    params.set("dateField", dateRange.field);
    
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  const handleRoleToggle = (roleName: string) => {
    let newRoles: string[];
    if (roleName === "all") {
      newRoles = [];
    } else {
      if (selectedRoles.includes(roleName)) {
        newRoles = selectedRoles.filter((r) => r !== roleName);
      } else {
        newRoles = [...selectedRoles, roleName];
      }
    }
    
    setSelectedRoles(newRoles);
    const params = new URLSearchParams(searchParams);
    if (newRoles.length > 0) params.set("roles", newRoles.join(","));
    else params.delete("roles");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleStatusToggle = (status: string) => {
    let newStatuses: string[];
    if (status === "all") {
      newStatuses = [];
    } else {
      if (selectedStatuses.includes(status)) {
        newStatuses = selectedStatuses.filter((s) => s !== status);
      } else {
        newStatuses = [...selectedStatuses, status];
      }
    }
    
    setSelectedStatuses(newStatuses);
    const params = new URLSearchParams(searchParams);
    if (newStatuses.length > 0) params.set("statuses", newStatuses.join(","));
    else params.delete("statuses");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalCount);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center text-gray-900">
        <div>
          <h1 className="text-2xl font-bold">사용자 관리</h1>
          <p className="text-sm text-gray-500">전체 사용자를 관리하고 권한을 설정하세요</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> 사용자 직접 생성
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-gray-200 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 border border-gray-300">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[110px] border-none bg-transparent focus:ring-0 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체검색</SelectItem>
                <SelectItem value="nickname">닉네임</SelectItem>
                <SelectItem value="name">성명</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="phone">연락처</SelectItem>
                <SelectItem value="identifier">아이디</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <div className="relative flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="검색어 입력..."
                className="border-none bg-transparent focus-visible:ring-0 h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Search className="absolute right-3 top-2 w-4 h-4 text-gray-400" />
            </div>
            <Button size="sm" onClick={executeSearch} className="ml-1 px-4 h-8">검색</Button>
          </div>

          <MultiSelect
            label="역할"
            options={[
              ...allRoles.map(r => ({ label: r.display_name, value: r.name })),
              { label: "권한 없음", value: "none" }
            ]}
            selectedValues={selectedRoles}
            onToggle={handleRoleToggle}
            placeholder="모든 역할"
          />

          <MultiSelect
            label="상태"
            options={[
              { label: "활성", value: "active" },
              { label: "비활성", value: "inactive" },
              { label: "정지", value: "suspended" }
            ]}
            selectedValues={selectedStatuses}
            onToggle={handleStatusToggle}
            placeholder="모든 상태"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-gray-300 p-1">
            <Input
              type="date"
              className="h-8 border-none focus-visible:ring-0 text-xs w-[125px]"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span className="text-gray-400">~</span>
            <Input
              type="date"
              className="h-8 border-none focus-visible:ring-0 text-xs w-[125px]"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>

          <Select value={dateRange.field} onValueChange={(val) => setDateRange(prev => ({ ...prev, field: val }))}>
            <SelectTrigger className="w-[100px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">가입일</SelectItem>
              <SelectItem value="last_sign_in_at">최근활동</SelectItem>
              <SelectItem value="confirmed_at">승인일</SelectItem>
              <SelectItem value="updated_at">수정일</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || dateRange.start || dateRange.end || selectedRoles.length > 0 || selectedStatuses.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedRoles([]);
                setSelectedStatuses([]);
                setDateRange({ start: "", end: "", field: "created_at" });
                setSearchParams(new URLSearchParams());
              }}
              className="text-gray-500 h-9"
            >
              <XCircle className="w-3 h-3 mr-1" /> 필터 초기화
            </Button>
          )}
        </div>
      </div>

      <UserTable
        users={users}
        loading={false}
        error={null}
        searchTerm={searchTerm}
        filterRole={selectedRoles.join(",")}
        filterStatus={selectedStatuses.join(",")}
        selectedUsers={selectedUsers}
        onToggleAll={toggleAllUsers}
        onToggleUser={toggleUserSelection}
        fetchUsers={executeSearch}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-700">
            총 <span className="font-medium">{totalCount}</span>명 중{" "}
            <span className="font-medium">
              {startItem}-{endItem}
            </span>{" "}
            표시
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              이전
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = Math.max(1, page - 2) + i;
              if (pageNumber > totalPages) return null;

              return (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="w-9 h-9 font-medium"
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>새 사용자 추가</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {pageFetcher.data?.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4" />
                {pageFetcher.data.error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="create-email">이메일</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="example@email.com"
                value={createFormData.email}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-nickname">닉네임</Label>
              <Input
                id="create-nickname"
                placeholder="사용할 닉네임"
                value={createFormData.nickname}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, nickname: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-password">비밀번호</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="최소 4자 이상"
                value={createFormData.password}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="create-mailing"
                  checked={createFormData.allowMailing}
                  onCheckedChange={(checked) => setCreateFormData(prev => ({ ...prev, allowMailing: !!checked }))}
                />
                <Label htmlFor="create-mailing" className="text-sm cursor-pointer font-normal">메일 수신 동의</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="create-message"
                  checked={createFormData.allowMessage}
                  onCheckedChange={(checked) => setCreateFormData(prev => ({ ...prev, allowMessage: !!checked }))}
                />
                <Label htmlFor="create-message" className="text-sm cursor-pointer font-normal">쪽지 수신 동의</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>취소</Button>
            <Button 
              disabled={
                !createFormData.email.includes("@") || 
                createFormData.password.length < 4 || 
                !createFormData.nickname || 
                pageFetcher.state !== "idle"
              }
              onClick={() => {
                pageFetcher.submit(
                  { 
                    intent: "create-user", 
                    ...createFormData,
                    allowMailing: String(createFormData.allowMailing),
                    allowMessage: String(createFormData.allowMessage)
                  },
                  { method: "post" }
                );
              }}
            >
              {pageFetcher.state !== "idle" ? "생성 중..." : "사용자 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
