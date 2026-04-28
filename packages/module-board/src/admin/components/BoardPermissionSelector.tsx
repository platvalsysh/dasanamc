import React, { useState } from "react";
import { type BoardPermissionConfig, type BoardPermissionType } from "../../BoardExtraVars";
import type { admin_roles } from "@repo/database";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Checkbox
} from "@repo/ui-admin";

// Define option types
type OptionType = { value: string; label: string };

interface BoardPermissionSelectorProps {
  label: string;
  value: BoardPermissionConfig;
  onChange: (newValue: BoardPermissionConfig) => void;
  roles: admin_roles[];
}

export function BoardPermissionSelector({
  label,
  value,
  onChange,
  roles,
}: BoardPermissionSelectorProps) {
  const [permissionType, setPermissionType] = useState<BoardPermissionType>(value.type);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(value.roles || []);

  const handleTypeChange = (val: string) => {
    const newType = val as BoardPermissionType;
    setPermissionType(newType);
    
    // Reset roles if not group type, but keep them in state just in case user switches back
    const newConfig: BoardPermissionConfig = {
      type: newType,
      roles: newType === "group" ? selectedRoles : undefined,
    };
    onChange(newConfig);
  };

  const handleRoleToggle = (roleId: string) => {
    let newRoles = [...selectedRoles];
    if (newRoles.includes(roleId)) {
      newRoles = newRoles.filter((id) => id !== roleId);
    } else {
      newRoles.push(roleId);
    }
    setSelectedRoles(newRoles);
    
    onChange({
      type: permissionType,
      roles: newRoles,
    });
  };

  return (
    <div className="border border-gray-200 p-4 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="text-sm font-medium text-gray-700 min-w-[120px]">{label}</label>
        
        <div className="flex-1 w-full">
          <Select
            value={permissionType}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-full sm:w-auto h-10 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 사용자</SelectItem>
              <SelectItem value="member">로그인 사용자</SelectItem>
              <SelectItem value="admin">게시판 관리자</SelectItem>
              <SelectItem value="group">선택 그룹</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {permissionType === "group" && (
        <div className="mt-4 pl-0 sm:pl-[120px]">
          <div className="bg-white border border-gray-200 p-3 max-h-48 overflow-y-auto">
             <div className="text-xs text-gray-500 mb-2">허용할 그룹을 선택하세요:</div>
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
      )}
    </div>
  );
}
