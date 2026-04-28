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

interface RoleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: {
    id: string;
    name: string;
  };
}

export function RoleDeleteDialog({ open, onOpenChange, role }: RoleDeleteDialogProps) {
  const submit = useSubmit();
  const [deleteRoleConfirmation, setDeleteRoleConfirmation] = useState("");

  const deleteRole = () => {
    const formData = new FormData();
    formData.append("intent", "deleteRole");
    formData.append("roleId", role.id);
    submit(formData, { method: "post" });
    onOpenChange(false);
    setDeleteRoleConfirmation("");
  };

  return (
    <Dialog 
        open={open} 
        onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) setDeleteRoleConfirmation("");
        }}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="text-red-600">역할 삭제</DialogTitle>
          <DialogDescription>
            정말로 이 역할을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <p className="text-sm font-medium text-gray-900">
             삭제를 확인하려면 아래에 <span className="text-red-600 select-all">{role.name}</span>을(를) 입력하세요.
          </p>
          <input
            type="text"
            value={deleteRoleConfirmation}
            onChange={(e) => setDeleteRoleConfirmation(e.target.value)}
            placeholder={role.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          />
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
              deleteRole();
            }}
            disabled={deleteRoleConfirmation !== role.name}
            className={`px-4 py-2 text-sm text-white rounded-md ${
              deleteRoleConfirmation === role.name
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            삭제
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
