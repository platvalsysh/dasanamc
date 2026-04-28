import { useState, useEffect } from "react";
import {
  useLoaderData,
  useSubmit,
  useActionData,
  useNavigation,
} from "react-router";
import { prisma } from "@repo/database";
import { PermissionGate } from "@repo/auth/ui";
import {
  Search,
  Shield,
  Plus,
  Trash2,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

// Types
// Types
interface User {
  id: string;
  identifier: string;
  display_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  level: number;
}

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  granted_at: string;
  granted_by: string;
  expires_at?: string;
  is_active: boolean;
  role: Role;
  granted_by_profile?: {
    display_name: string;
  };
  user_profile?: {
    id: string;
    identifier: string;
    display_name: string;
    email: string;
    phone: string;
    profile_image?: string;
  };
}


async function getUserRoles(selectedRoleId?: string | null) {
  if (!selectedRoleId) {
    return [];
  }
  const urData = await prisma.admin_user_roles.findMany({
    where: {
      role_id: selectedRoleId,
    },
    select: {
      id: true,
      role_id: true,
      user_id: true,
      granted_at: true,
      expires_at: true,
      is_active: true,
      admin_roles: true,
      granted_by: true,
      users_admin_user_roles_user_idTousers: {
          select: {
            id: true,
            phone: true,
            email: true,
            identifiers: {
              select: {
                identifier: true,
              }
            },
            profiles: {
              select: {
                display_name: true,
                profile_image: true,
              }
            }
          }
      },
      users_admin_user_roles_granted_byTousers: {
          select: {
            id: true,
            phone: true,
            email: true,
            identifiers: {
              select: {
                identifier: true,
              }
            },
            profiles: {
              select: {
                display_name: true,
                profile_image: true,
              }
            }
          }
      },
    },
    orderBy: { granted_at: "desc" },
  });

  const userRoles = urData.map((ur) => {
    const u = ur.users_admin_user_roles_user_idTousers;
    const g = ur.users_admin_user_roles_granted_byTousers;

    let u_name = "Unknown";
    let u_img = undefined;
    let u_id_val = "N/A";
    let u_email = "";
    let u_phone = "";

    if (u) {
        u_name = u.profiles?.display_name || "Unknown";
        u_img = u.profiles?.profile_image;
        u_id_val = u.identifiers?.identifier || "N/A";
        u_email = u.email || "";
        u_phone = u.phone || "";
    }

    let g_name = "System";
    if (g) {
        g_name = g.profiles?.display_name || "System";
    }

    return {
      id: ur.id,
      user_id: ur.user_id,
      role_id: ur.role_id,
      granted_at: ur.granted_at ? ur.granted_at.toISOString() : "",
      granted_by: ur.granted_by || "",
      expires_at: ur.expires_at ? ur.expires_at.toISOString() : undefined,
      is_active: ur.is_active || false,
      role: ur.admin_roles,
      granted_by_profile: { display_name: g_name },
      user_profile: {
        id: u.id,
        identifier: u_id_val,
        display_name: u_name,
        email: u_email,
        phone: u_phone,
        profile_image: u_img,
      },
    };
  });

  return userRoles;
}

// Loader
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search") || "";
  const selectedRoleId = url.searchParams.get("roleId");

  const roles = await prisma.admin_roles.findMany({
    where: { is_active: true },
    orderBy: { level: "asc" },
  });

  let users: User[] = [];
  if (searchTerm) {
    const foundUsers = await prisma.users.findMany({
      where: {
        OR: [
          { email: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
          // Add identifiers search if needed
          { identifiers: { identifier: { contains: searchTerm, mode: "insensitive" } } },
          { profiles: { display_name: { contains: searchTerm, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        email: true,
        phone: true,
        created_at: true,
        identifiers: {
          select: {
            identifier: true,
          }
        },
        profiles: {
          select: {
            display_name: true,
            profile_image: true,
          }
        }
      },
      take: 10,
    });

    users = foundUsers.map((u) => {
      const display_name = u.profiles?.display_name || "Unknown";
      const profile_image = u.profiles?.profile_image || undefined;
      const identifier = u.identifiers?.identifier || "N/A";

      return {
        id: u.id,
        identifier,
        display_name,
        email: u.email || "",
        phone: u.phone || "",
        profile_image,
        created_at: u.created_at ? u.created_at.toISOString() : "",
      };
    });
  }

  const userRoles = await getUserRoles(selectedRoleId);

  return { roles, users, userRoles, searchTerm, selectedRoleId };
}

// Action
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "assignRole") {
    const userId = formData.get("userId") as string;
    const roleId = formData.get("roleId") as string;
    // const grantedBy = ... // We need current user ID.
    // In a real app, we get it from session.
    // For now, let's assume system or null if we can't get it easily in this context without auth helper.
    // But we should try.

    // Check if already assigned
    const existing = await prisma.admin_user_roles.findFirst({
      where: {
        user_id: userId,
        role_id: roleId,
      },
    });

    if (existing) {
      return { error: "이미 해당 역할이 부여되어 있습니다." };
    }

    await prisma.admin_user_roles.create({
      data: {
        user_id: userId,
        role_id: roleId,
        is_active: true,
        granted_at: new Date(),
        // granted_by: ...
      },
    });

    return { success: true, message: "역할이 부여되었습니다." };
  }

  if (intent === "revokeRole") {
    const userRoleId = formData.get("userRoleId") as string;
    await prisma.admin_user_roles.delete({
      where: { id: userRoleId },
    });
    return { success: true, message: "역할이 해제되었습니다." };
  }

  return null;
}

export default function AdminAssignRoles() {
  const { roles, users, userRoles, searchTerm, selectedRoleId } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    roles.find((r) => r.id === selectedRoleId) || null,
  );

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedRoleId) {
      const role = roles.find((r) => r.id === selectedRoleId);
      if (role) setSelectedRole(role);
    }
  }, [selectedRoleId, roles]);

  const handleSearch = (term: string) => {
    setLocalSearchTerm(term);
    // Debounce or just submit on enter?
    // Let's submit on enter or button, or debounce.
    // For simplicity, just update state and let user press enter or we can debounce submit.
  };

  const executeSearch = () => {
    const formData = new FormData();
    if (localSearchTerm) formData.set("search", localSearchTerm);
    if (selectedRole) formData.set("roleId", selectedRole.id);
    submit(formData, { method: "get" });
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    const formData = new FormData();
    if (localSearchTerm) formData.set("search", localSearchTerm);
    formData.set("roleId", role.id);
    submit(formData, { method: "get" });
  };

  const assignRole = (userId: string) => {
    if (!selectedRole) return;
    const formData = new FormData();
    formData.append("intent", "assignRole");
    formData.append("userId", userId);
    formData.append("roleId", selectedRole.id);
    submit(formData, { method: "post" });
  };

  const revokeRole = (userRoleId: string) => {
    if (!confirm("정말 이 역할을 해제하시겠습니까?")) return;
    const formData = new FormData();
    formData.append("intent", "revokeRole");
    formData.append("userRoleId", userRoleId);
    submit(formData, { method: "post" });
  };

  const getRoleBadgeColor = (level: number) => {
    const colors = {
      1: "bg-red-100 text-red-800",
      2: "bg-orange-100 text-orange-800",
      3: "bg-blue-100 text-blue-800",
      4: "bg-green-100 text-green-800",
      5: "bg-purple-100 text-purple-800",
      6: "bg-gray-100 text-gray-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const loading =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">역할 부여 관리</h1>
        <p className="text-gray-600 mt-1">
          역할을 선택하고 사용자에게 부여하거나 해제하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Role List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              역할 목록
            </h2>

            {roles.length === 0 ? (
              <p className="text-sm text-gray-500">역할을 불러오는 중...</p>
            ) : (
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedRole?.id === role.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role.level)}`}
                        >
                          {role.display_name}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {role.description || ""}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: User Management for Selected Role */}
        <div className="lg:col-span-2">
          {!selectedRole ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                역할을 선택하세요
              </h3>
              <p className="text-gray-500">
                좌측에서 관리할 역할을 선택하면 해당 역할의 사용자들을 확인하고
                새로운 사용자에게 역할을 부여할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Role Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-gray-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedRole.display_name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedRole.description}
                    </p>
                  </div>
                </div>

                {/* Notifications */}
                {actionData?.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700">{actionData.error}</p>
                  </div>
                )}

                {actionData?.success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700">
                      {actionData.message}
                    </p>
                  </div>
                )}

                {/* User Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 사용자 추가
                  </label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="사용자 이름 또는 이메일로 검색..."
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && executeSearch()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={executeSearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      검색
                    </button>
                  </div>

                  {loading && localSearchTerm && (
                    <div className="mt-2 text-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  )}

                  {users.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                      {users.map((user) => (
                        <PermissionGate
                          key={user.id}
                          permission={["admins.create", "admins.edit"]}
                        >
                          <button
                            onClick={() => assignRole(user.id)}
                            disabled={loading}
                            className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              {user.profile_image ? (
                                <img
                                  src={user.profile_image}
                                  alt={user.display_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {user.display_name}
                              </p>
                              <div className="flex flex-col gap-0.5">
                                {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                                {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                                {user.identifier !== "N/A" && <div className="text-xs text-gray-400 mt-1">ID: {user.identifier}</div>}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-blue-500" />
                          </button>
                        </PermissionGate>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Users with Role */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedRole.display_name} 역할을 가진 사용자 (
                  {userRoles.length}명)
                </h3>

                {userRoles.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    해당 역할을 가진 사용자가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {userRoles.map((userRole) => (
                      <div
                        key={userRole.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {userRole.user_profile?.profile_image ? (
                              <img
                                src={userRole.user_profile.profile_image}
                                alt={userRole.user_profile.display_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {userRole.user_profile?.display_name || "Unknown"}
                            </p>
                            <div className="flex flex-col gap-0.5 mb-1">
                                {userRole.user_profile?.email && <span className="text-xs text-gray-500">{userRole.user_profile.email}</span>}
                                {userRole.user_profile?.phone && <span className="text-xs text-gray-500">{userRole.user_profile.phone}</span>}
                                {userRole.user_profile?.identifier !== "N/A" && <span className="text-xs text-gray-400">ID: {userRole.user_profile?.identifier}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              부여일:{" "}
                              {new Date(userRole.granted_at).toLocaleDateString(
                                "ko-KR",
                              )}
                              {userRole.granted_by_profile?.display_name && (
                                <span>
                                  • 부여자:{" "}
                                  {userRole.granted_by_profile.display_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <PermissionGate
                          permission={["admins.edit", "admins.delete"]}
                        >
                          <button
                            onClick={() => revokeRole(userRole.id)}
                            disabled={loading}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                            title="역할 해제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGate>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
