import { useState, useEffect } from "react";
import { useSubmit } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-admin";

interface RoleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: {
    id: string;
    display_name: string;
    description: string;
    level: number;
    is_active: boolean;
  };
}

export function RoleEditDialog({ open, onOpenChange, role }: RoleEditDialogProps) {
  const submit = useSubmit();
  const [editRoleDisplayName, setEditRoleDisplayName] = useState(role.display_name);
  const [editRoleDescription, setEditRoleDescription] = useState(role.description);
  const [editRoleLevel, setEditRoleLevel] = useState(role.level);
  const [editRoleIsActive, setEditRoleIsActive] = useState(role.is_active);

  // Sync state when role changes or dialog opens
  useEffect(() => {
    if (open) {
      setEditRoleDisplayName(role.display_name);
      setEditRoleDescription(role.description);
      setEditRoleLevel(role.level);
      setEditRoleIsActive(role.is_active);
    }
  }, [open, role]);

  const saveRole = () => {
    const formData = new FormData();
    formData.append("intent", "updateRole");
    formData.append("roleId", role.id);
    formData.append("displayName", editRoleDisplayName);
    formData.append("description", editRoleDescription);
    formData.append("level", editRoleLevel.toString());
    formData.append("isActive", editRoleIsActive.toString());
    submit(formData, { method: "post" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>역할 수정</DialogTitle>
          <DialogDescription>역할 정보를 수정합니다.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              표시 이름
            </label>
            <input
              type="text"
              value={editRoleDisplayName}
              onChange={(e) => setEditRoleDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">레벨</label>
              <input
                type="number"
                value={editRoleLevel}
                onChange={(e) => setEditRoleLevel(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">상태</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={editRoleIsActive}
                  onChange={(e) => setEditRoleIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">활성화</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">설명</label>
            <textarea
              value={editRoleDescription}
              onChange={(e) => setEditRoleDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              saveRole();
            }}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            저장
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
