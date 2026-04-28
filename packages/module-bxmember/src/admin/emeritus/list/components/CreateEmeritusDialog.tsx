import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-admin";
import { useFetcher } from "react-router";
import { useEffect } from "react";

interface CreateEmeritusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEmeritusDialog({
  open,
  onOpenChange,
}: CreateEmeritusDialogProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      onOpenChange(false);
    }
  }, [fetcher.state, fetcher.data, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>추가</DialogTitle>
          <DialogDescription>
            새로운 교수를 추가합니다.
          </DialogDescription>
        </DialogHeader>

        <fetcher.Form method="post" className="space-y-6">
          <input type="hidden" name="intent" value="create" />
          
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">이름(한글)</label>
                    <input name="name_kor" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">이메일</label>
                    <input name="email" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">휴대폰</label>
                    <input name="cellphone_number" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                 </div>
            </div>

          <DialogFooter>
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
              {isSubmitting ? "추가 중..." : "추가"}
            </button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
