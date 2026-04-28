import { useState } from "react";
import { useSubmit } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-admin";

interface RoleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleCreateDialog({ open, onOpenChange }: RoleCreateDialogProps) {
  const submit = useSubmit();
  const [createRoleName, setCreateRoleName] = useState("");
  const [createRoleDisplayName, setCreateRoleDisplayName] = useState("");
  const [createRoleDescription, setCreateRoleDescription] = useState("");
  const [createRoleLevel, setCreateRoleLevel] = useState(99);
  const [createRoleIsActive, setCreateRoleIsActive] = useState(true);

  const cancelCreate = () => {
    onOpenChange(false);
    // Reset state after a short delay for animation or immediately
    setTimeout(() => {
        setCreateRoleName("");
        setCreateRoleDisplayName("");
        setCreateRoleDescription("");
        setCreateRoleLevel(99);
        setCreateRoleIsActive(true);
    }, 100);
  };

  const createRole = () => {
    const formData = new FormData();
    formData.append("intent", "createRole");
    formData.append("name", createRoleName);
    formData.append("displayName", createRoleDisplayName);
    formData.append("description", createRoleDescription);
    formData.append("level", createRoleLevel.toString());
    formData.append("isActive", createRoleIsActive.toString());
    submit(formData, { method: "post" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 역할 생성</DialogTitle>
          <DialogDescription>
            새로운 역할을 생성합니다. 역할 ID는 영문으로 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              역할 ID (영문)
            </label>
            <input
              type="text"
              placeholder="admin"
              value={createRoleName}
              onChange={(e) => setCreateRoleName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              표시 이름
            </label>
            <input
              type="text"
              placeholder="관리자"
              value={createRoleDisplayName}
              onChange={(e) => setCreateRoleDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">레벨</label>
              <input
                type="number"
                placeholder="99"
                value={createRoleLevel}
                onChange={(e) =>
                  setCreateRoleLevel(parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">상태</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={createRoleIsActive}
                  onChange={(e) => setCreateRoleIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">활성화</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">설명</label>
            <textarea
              placeholder="시스템 관리자 역할입니다."
              value={createRoleDescription}
              onChange={(e) => setCreateRoleDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={cancelCreate}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={createRole}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            생성
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
