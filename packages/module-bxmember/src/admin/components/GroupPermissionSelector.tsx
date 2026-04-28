import { Checkbox } from "@repo/ui-admin";
import type { admin_roles } from "@repo/database";

interface GroupPermissionSelectorProps {
  label: string;
  selectedRoles: string[]; // List of role names
  onChange: (selectedRoles: string[]) => void;
  roles: admin_roles[];
}

export function GroupPermissionSelector({
  label,
  selectedRoles,
  onChange,
  roles,
}: GroupPermissionSelectorProps) {
  const handleRoleToggle = (roleName: string) => {
    let newRoles = [...selectedRoles];
    if (newRoles.includes(roleName)) {
      newRoles = newRoles.filter((name) => name !== roleName);
    } else {
      newRoles.push(roleName);
    }
    onChange(newRoles);
  };

  return (
    <div className="border border-gray-200 p-4 bg-gray-50">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        
        <div className="bg-white border border-gray-200 p-3 max-h-48 overflow-y-auto mt-2">
             <div className="text-xs text-gray-500 mb-2">허용할 그룹을 선택하세요 (선택하지 않으면 아무도 접근할 수 없습니다):</div>
             <div className="space-y-2">
                {roles.length === 0 && <div className="text-sm text-gray-400">등록된 그룹(Role)이 없습니다.</div>}
                {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1">
                    <Checkbox
                      checked={selectedRoles.includes(role.name)}
                      onCheckedChange={() => handleRoleToggle(role.name)}
                    />
                    <span className="text-sm text-gray-700">{role.display_name}</span>
                  </label>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
}
