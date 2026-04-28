
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@repo/ui-admin";
import { LucideDownload } from "lucide-react";

interface ExcelDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchParams: URLSearchParams;
}

export function ExcelDownloadDialog({
  open,
  onOpenChange,
  searchParams,
}: ExcelDownloadDialogProps) {
  const keyword = searchParams.get("search_keyword") || "";
  const field = searchParams.get("search_target") || "";

  const handleDownload = (type: "all" | "filtered") => {
    let url = "/admin/api/bxmember/member/excel-download";
    if (type === "filtered") {
      url += `?keyword=${keyword}&field=${field}`;
    }
    window.open(url, "_blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>엑셀 다운로드 옵션</DialogTitle>
          <DialogDescription>
            검색 조건이 적용되어 있습니다. 다운로드할 데이터를 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col gap-4">
          <Button
            variant="outline"
            className="flex items-center justify-between h-auto p-4"
            onClick={() => handleDownload("filtered")}
          >
             <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-gray-900">검색 결과만 다운로드</span>
                <span className="text-xs text-gray-500">현재 검색된 목록만 엑셀로 저장합니다.</span>
             </div>
             <LucideDownload className="text-gray-400" />
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-between h-auto p-4"
            onClick={() => handleDownload("all")}
          >
             <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-gray-900">전체 데이터 다운로드</span>
                <span className="text-xs text-gray-500">검색 조건 없이 전체 회원을 저장합니다.</span>
             </div>
             <LucideDownload className="text-gray-400" />
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
