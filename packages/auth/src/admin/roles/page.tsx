import { moduleManager } from "@repo/core/server";
import { prisma } from "@repo/database";
import { useEffect, useState } from "react";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";

import type { ActionFunctionArgs } from "react-router";

import { PermissionMatrix } from "./components/PermissionMatrix";
import { RoleList } from "./components/RoleList";

// Types
interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  is_dangerous: boolean;
  is_system: boolean;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  level: number;
  is_active: boolean;
  userCount: number;
  permissions: string[];
  is_system: boolean;
}

// Loader
export async function loader() {
  const [permissionsData, rolesData] = await Promise.all([
    prisma.admin_permissions.findMany({
      orderBy: { category: "asc" },
    }),
    prisma.admin_roles.findMany({
      // where: { is_active: true }, // Show all roles including inactive ones for admin
      orderBy: { level: "asc" },
      include: {
        admin_role_permissions: {
          include: {
            admin_permissions: true,
          },
        },
        _count: {
          select: { admin_user_roles: true },
        },
      },
    }),
  ]);

  const formattedPermissions: Permission[] = permissionsData.map((perm) => ({
    id: perm.id,
    name: perm.name,
    display_name: perm.display_name || perm.name,
    description: perm.description || "",
    category: perm.category,
    is_dangerous: perm.is_dangerous || false,
    is_system: moduleManager.isSystemPermission(perm.name),
  }));

  const formattedRoles: Role[] = rolesData.map((role) => ({
    id: role.id,
    name: role.name,
    display_name: role.display_name,
    description: role.description || "",
    level: role.level,
    is_active: role.is_active || false,
    userCount: role._count.admin_user_roles,
    permissions: role.admin_role_permissions.map(
      (rp) => rp.admin_permissions.name,
    ),
    is_system: moduleManager.isSystemRole(role.name),
  }));

  return { permissions: formattedPermissions, roles: formattedRoles };
}

// Action
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "createRole") {
    const displayName = formData.get("displayName") as string;
    const description = formData.get("description") as string;
    const name = formData.get("name") as string; // Internal name
    const level = parseInt(formData.get("level") as string) || 99;
    const isActive = formData.get("isActive") === "true";

    if (!name || !displayName) {
      return { success: false, message: "역할 이름과 표시 이름은 필수입니다." };
    }
    
    // Check if role name is a system role (though creating one with same name might be what they assume is fine, but if it exists in DB it matches)
    // Actually create allows new roles. But check if it conflicts with system role name?
    // DB unique constraint handles name conflict.

    try {
      await prisma.admin_roles.create({
        data: {
          name,
          display_name: displayName,
          description,
          level,
          is_active: isActive,
        },
      });
      return { success: true, message: "새로운 역할이 생성되었습니다." };
    } catch (error) {
      console.error("Failed to create role:", error);
      return {
        success: false,
        message:
          "역할 생성 중 오류가 발생했습니다. 이미 존재하는 역할 이름일 수 있습니다.",
      };
    }
  }

  if (intent === "updateRole") {
    const roleId = formData.get("roleId") as string;
    
    const role = await prisma.admin_roles.findUnique({ where: { id: roleId } });
    if (role && moduleManager.isSystemRole(role.name)) {
        return { success: false, message: "시스템 역할은 수정할 수 없습니다." };
    }

    const displayName = formData.get("displayName") as string;
    const description = formData.get("description") as string;
    const level = parseInt(formData.get("level") as string);
    const isActive = formData.get("isActive") === "true";

    await prisma.admin_roles.update({
      where: { id: roleId },
      data: {
        display_name: displayName,
        description: description,
        level: isNaN(level) ? undefined : level,
        is_active: isActive,
        updated_at: new Date(),
      },
    });

    return { success: true, message: "역할 정보가 업데이트되었습니다." };
  }

  if (intent === "deleteRole") {
    const roleId = formData.get("roleId") as string;
    
    const role = await prisma.admin_roles.findUnique({ where: { id: roleId } });
    if (role && moduleManager.isSystemRole(role.name)) {
        return { success: false, message: "시스템 역할은 삭제할 수 없습니다." };
    }

    try {
      // First delete related permissions
      await prisma.admin_role_permissions.deleteMany({
        where: { role_id: roleId },
      });
      // Then delete the role
      await prisma.admin_roles.delete({
        where: { id: roleId },
      });
      return { success: true, message: "역할이 삭제되었습니다." };
    } catch (error) {
      console.error("Failed to delete role:", error);
      return {
        success: false,
        message:
          "역할 삭제 중 오류가 발생했습니다. 사용자가 할당된 역할은 삭제할 수 없습니다.",
      };
    }
  }

  // createPermission REMOVED as per request

  if (intent === "deletePermission") {
    const permissionId = formData.get("permissionId") as string;
    
    const permission = await prisma.admin_permissions.findUnique({ where: { id: permissionId } });
    if (permission && moduleManager.isSystemPermission(permission.name)) {
        return { success: false, message: "시스템 권한은 삭제할 수 없습니다." };
    }

    try {
      // First delete related role permissions
      await prisma.admin_role_permissions.deleteMany({
        where: { permission_id: permissionId },
      });
      // Then delete the permission
      await prisma.admin_permissions.delete({
        where: { id: permissionId },
      });
      return { success: true, message: "권한이 삭제되었습니다." };
    } catch (error) {
      console.error("Failed to delete permission:", error);
      return { success: false, message: "권한 삭제 중 오류가 발생했습니다." };
    }
  }

  if (intent === "updatePermissions") {
    const data = JSON.parse(formData.get("data") as string);
    // data is array of roles with their new permissions
    
    for (const roleData of data) {
       // Check if modifying system role
       const role = await prisma.admin_roles.findUnique({ where: { id: roleData.id } });
       if (role && moduleManager.isSystemRole(role.name)) {
           // Skip system roles, they shouldn't be modifiable via UI here
           // Or should we throw error?
           // The UI should prevent this, but safer to skip silently or error.
           // Let's skip.
           continue; 
       }

      const currentRole = await prisma.admin_roles.findUnique({
        where: { id: roleData.id },
        include: {
          admin_role_permissions: { include: { admin_permissions: true } },
        },
      });

      if (!currentRole) continue;

      const currentPermNames = currentRole.admin_role_permissions.map(
        (rp) => rp.admin_permissions.name,
      );
      const newPermNames = roleData.permissions as string[];

      const toAdd = newPermNames.filter((p) => !currentPermNames.includes(p));
      const toRemove = currentPermNames.filter(
        (p) => !newPermNames.includes(p),
      );

      // Add
      for (const permName of toAdd) {
        const perm = await prisma.admin_permissions.findUnique({
          where: { name: permName },
        });
        if (perm) {
            // Can we assign system permissions to custom roles? Yes.
            // So no check needed on perm type here.
          await prisma.admin_role_permissions.create({
            data: {
              role_id: roleData.id,
              permission_id: perm.id,
            },
          });
        }
      }

      // Remove
      for (const permName of toRemove) {
        const perm = await prisma.admin_permissions.findUnique({
          where: { name: permName },
        });
        if (perm) {
          await prisma.admin_role_permissions.deleteMany({
            where: {
              role_id: roleData.id,
              permission_id: perm.id,
            },
          });
        }
      }
    }

    return { success: true, message: "권한 설정이 저장되었습니다." };
  }

  return null;
}

export default function AdminUsersRoles() {
  const { permissions, roles: initialRoles } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();

  // "Source of truth" data
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    initialRoles.length > 0 ? initialRoles[0] : null,
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalRoles, setOriginalRoles] = useState<Role[]>(
    JSON.parse(JSON.stringify(initialRoles)),
  );

  // Sync state with loader data if it changes (e.g. after action)
  useEffect(() => {
    setRoles(initialRoles);
    setOriginalRoles(JSON.parse(JSON.stringify(initialRoles)));
    setHasUnsavedChanges(false);

    if (selectedRole) {
      const updatedSelected = initialRoles.find(
        (r) => r.id === selectedRole.id,
      );
      if (updatedSelected) setSelectedRole(updatedSelected);
      else if (initialRoles.length > 0)
        setSelectedRole(initialRoles[initialRoles.length - 1]); // Select newly created role if possible
      else setSelectedRole(null);
    } else if (initialRoles.length > 0) {
      setSelectedRole(initialRoles[0]);
    }
  }, [initialRoles]);

  const togglePermission = (roleId: string, permissionName: string) => {
    // Prevent modification of System Roles
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    if (role.is_system) {
        alert("시스템 역할의 권한은 수정할 수 없습니다.");
        return;
    }

    const hasPermission = role.permissions.includes(permissionName);

    const updatedRoles = roles.map((r) => {
      if (r.id === roleId) {
        const newPermissions = hasPermission
          ? r.permissions.filter((p) => p !== permissionName)
          : [...r.permissions, permissionName];
        return { ...r, permissions: newPermissions };
      }
      return r;
    });

    setRoles(updatedRoles);
    setHasUnsavedChanges(true);

    if (selectedRole?.id === roleId) {
      const updatedSelectedRole = updatedRoles.find((r) => r.id === roleId);
      if (updatedSelectedRole) {
        setSelectedRole(updatedSelectedRole);
      }
    }
  };

  const saveAllChanges = () => {
    const formData = new FormData();
    formData.append("intent", "updatePermissions");
    formData.append("data", JSON.stringify(roles));
    submit(formData, { method: "post" });
  };

  const resetChanges = () => {
    if (confirm("모든 변경사항을 취소하고 원래 상태로 되돌리시겠습니까?")) {
      setRoles(JSON.parse(JSON.stringify(originalRoles)));
      if (selectedRole) {
        const originalSelectedRole = originalRoles.find(
          (r) => r.id === selectedRole.id,
        );
        if (originalSelectedRole) {
          setSelectedRole(originalSelectedRole);
        }
      }
      setHasUnsavedChanges(false);
    }
  };

  const loading =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">권한 관리</h1>
        <p className="text-gray-600 mt-1">사용자 역할과 권한을 관리합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
             <RoleList 
                roles={roles} 
                selectedRole={selectedRole} 
                onSelectRole={setSelectedRole} 
             />
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-2">
          {selectedRole && (
             <PermissionMatrix
                selectedRole={selectedRole}
                permissions={permissions}
                hasUnsavedChanges={hasUnsavedChanges}
                onTogglePermission={togglePermission}
                onSave={saveAllChanges}
                onReset={resetChanges}
                loading={loading}
                actionData={actionData}
             />
          )}
        </div>
      </div>
    </div>
  );
}
