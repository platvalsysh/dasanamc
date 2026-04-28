import { useState } from "react";
import { Shield, CheckCircle2, XCircle, Lock, Edit, Trash2, Plus } from "lucide-react";

import { RoleCreateDialog } from "./RoleCreateDialog";
import { RoleEditDialog } from "./RoleEditDialog";
import { RoleDeleteDialog } from "./RoleDeleteDialog";

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

interface RoleListProps {
  roles: Role[];
  selectedRole: Role | null;
  onSelectRole: (role: Role) => void;
}

export function RoleList({ roles, selectedRole, onSelectRole }: RoleListProps) {
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const getRoleColor = (level: number) => {
    const colors = [
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-green-100 text-green-700 border-green-200",
      "bg-yellow-100 text-yellow-700 border-yellow-200",
      "bg-gray-100 text-gray-700 border-gray-200",
    ];
    return (
      colors[Math.min(level - 1, colors.length - 1)] ||
      colors[colors.length - 1]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">역할 목록</h2>
          <button 
            onClick={() => setIsCreatingRole(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <RoleCreateDialog 
            open={isCreatingRole} 
            onOpenChange={setIsCreatingRole} 
          />
        </div>
      </div>

      <div className="p-4 space-y-2">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => onSelectRole(role)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedRole?.id === role.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">
                  {role.display_name}
                </span>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role.level)}`}
              >
                Lv.{role.level}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <span className="font-mono bg-gray-100 px-1 rounded">
                {role.name}
              </span>
              <span>•</span>
              <span
                className={
                  role.is_active
                    ? "text-green-600 flex items-center gap-1"
                    : "text-gray-400 flex items-center gap-1"
                }
              >
                {role.is_active ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {role.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {role.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {role.userCount}명 • {role.permissions.length}개 권한
              </span>
              <div className="flex gap-1">
                {role.is_system ? (
                  <div className="p-1 flex items-center gap-1 text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs">System</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRole(role);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingRole(role);
                        }}
                        className="p-1 text-gray-500 hover:text-red-600"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {editingRole && (
          <RoleEditDialog 
            open={!!editingRole} 
            onOpenChange={(open) => {
                if (!open) setEditingRole(null);
            }} 
            role={editingRole}
          />
      )}

      {deletingRole && (
          <RoleDeleteDialog
             open={!!deletingRole}
             onOpenChange={(open) => {
                 if (!open) setDeletingRole(null);
             }}
             role={deletingRole}
          />
      )}
    </div>
  );
}
