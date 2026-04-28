import { useState } from "react";
import { useSubmit } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui-admin";
import { Trash2 } from "lucide-react";

interface PermissionDeleteDialogProps {
  permission: {
    id: string;
    name: string;
  };
}

export function PermissionDeleteDialog({ permission }: PermissionDeleteDialogProps) {
  const submit = useSubmit();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const deletePermission = () => {
    const formData = new FormData();
    formData.append("intent", "deletePermission");
    formData.append("permissionId", permission.id);
    submit(formData, { method: "post" });
    setOpen(false);
    setConfirmation("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setConfirmation("");
      }}
    >
      <DialogTrigger asChild>
        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">권한 삭제</DialogTitle>
          <DialogDescription>
            정말로 이 권한을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <p className="text-sm font-medium text-gray-900">
             삭제를 확인하려면 아래에 <span className="text-red-600 select-all">{permission.name}</span>을(를) 입력하세요.
          </p>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={permission.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <DialogFooter>
          <button
            onClick={() => {
              setOpen(false);
            }}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={deletePermission}
            disabled={confirmation !== permission.name}
            className={`px-4 py-2 text-sm text-white rounded-md ${
              confirmation === permission.name
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
