import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-admin";
import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import type { bxprofessor } from "@repo/database";

interface EditProfessorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professor: bxprofessor | null;
}

export function EditProfessorDialog({
  open,
  onOpenChange,
  professor,
}: EditProfessorDialogProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      onOpenChange(false);
      setDeleteConfirm(false);
    }
  }, [fetcher.state, fetcher.data, onOpenChange]);

  if (!professor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>정보 수정</DialogTitle>
          <DialogDescription>
            교수 정보를 수정하거나 삭제합니다.
          </DialogDescription>
        </DialogHeader>

        <fetcher.Form method="post" className="space-y-6">
          <input type="hidden" name="intent" value={deleteConfirm ? "delete" : "update"} />
          <input type="hidden" name="seq" value={professor.seq.toString()} />
          
           <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">이름(한글)</label>
                    <input name="name_kor" defaultValue={professor.name_kor || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">이메일</label>
                    <input name="email" defaultValue={professor.email || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">휴대폰</label>
                    <input name="cellphone_number" defaultValue={professor.cellphone_number || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                 </div>
            </div>

          {!deleteConfirm ? (
            <DialogFooter className="flex justify-between w-full sm:justify-between">
              <button
                 type="button"
                 onClick={() => setDeleteConfirm(true)}
                 className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-md transition-colors"
               >
                 삭제
               </button>
               <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "저장 중..." : "저장"}
                  </button>
               </div>
            </DialogFooter>
          ) : (
             <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 mb-4">정말로 이 교수를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                     onClick={() => setDeleteConfirm(false)}
                     className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                   <button
                    type="submit"
                    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    삭제 확인
                  </button>
                </div>
             </div>
          )}
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
