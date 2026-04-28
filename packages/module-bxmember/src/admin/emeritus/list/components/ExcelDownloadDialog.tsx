import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  const handleDownload = (type: "all" | "filtered") => {
    let url = "/admin/api/bxmember/emeritus/excel-download";
    if (type === "filtered") {
      const params = new URLSearchParams();
      if (searchParams.get("search_keyword")) {
        params.set("keyword", searchParams.get("search_keyword") || "");
      }
      if (searchParams.get("search_target")) {
        params.set("field", searchParams.get("search_target") || "");
      }
      url += `?${params.toString()}`;
    }
    
    window.open(url, "_blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>엑셀 다운로드 옵션</DialogTitle>
          <DialogDescription>
            다운로드 옵션을 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <button
            onClick={() => handleDownload("filtered")}
            className="w-full flex items-center justify-between p-4 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium text-blue-900">
                검색 결과만 다운로드
              </span>
              <span className="text-sm text-blue-600">
                현재 적용된 검색 필터 기준
              </span>
            </div>
            <LucideDownload className="text-blue-500 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={() => handleDownload("all")}
            className="w-full flex items-center justify-between p-4 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors group"
          >
             <div className="flex flex-col items-start">
              <span className="font-medium text-gray-900">
                전체 데이터 다운로드
              </span>
              <span className="text-sm text-gray-500">
                검색 조건을 무시하고 전체 다운로드
              </span>
            </div>
             <LucideDownload className="text-gray-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            취소
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
