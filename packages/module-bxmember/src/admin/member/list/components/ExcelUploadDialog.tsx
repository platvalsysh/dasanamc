
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@repo/ui-admin";
import { type ChangeEvent, useState, type DragEvent, useEffect } from "react";
import { useFetcher } from "react-router";
import { LucideUpload, LucideFileSpreadsheet, LucideX } from "lucide-react";

interface ExcelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExcelUploadDialog({ open, onOpenChange }: ExcelUploadDialogProps) {
  const fetcher = useFetcher();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isSubmitting = fetcher.state === "submitting" || fetcher.state === "loading";
  const isSuccess = fetcher.data?.success;

  // Reset state when dialog closes or upload succeeds
  // Handle feedback
  useEffect(() => {
    // console.log("Fetcher State:", fetcher.state, "Data:", fetcher.data);
    if (fetcher.state === "idle" && fetcher.data) {
        // JsonResponse wraps data in a 'data' property
        const responseProxy = fetcher.data; 
        // If success
        if (!responseProxy.error && responseProxy.data?.success) {
            alert(`성공적으로 업로드되었습니다. (처리 건수: ${responseProxy.data.count})`);
            setFile(null);
            onOpenChange(false);
            window.location.reload();
        } 
        // If error
        else if (responseProxy.error) {
            alert(`업로드 실패: ${responseProxy.message || "Unknown error"}`);
        }
    }
  }, [fetcher.state, fetcher.data, onOpenChange]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    // Simple extension check as fallback
    const validExtensions = [".xls", ".xlsx"];
    const extension = "." + selectedFile.name.split(".").pop()?.toLowerCase();

    if (validTypes.includes(selectedFile.type) || validExtensions.includes(extension)) {
      setFile(selectedFile);
    } else {
      alert("엑셀 파일(.xls, .xlsx)만 업로드 가능합니다.");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    fetcher.submit(formData, {
      method: "post",
      action: "/admin/api/bxmember/member/excel-upload",
      encType: "multipart/form-data",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>엑셀 일괄 업로드</DialogTitle>
          <DialogDescription>
            엑셀 파일을 업로드하여 회원을 일괄 등록/수정합니다.
            <br />
            기존 회원은 SEQ를 기준으로 수정되며, SEQ가 없으면 신규 등록됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("excel-upload-input")?.click()}
            >
              <LucideUpload className="w-10 h-10 text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-900">
                클릭하여 파일 선택 또는 드래그 앤 드롭
              </p>
              <p className="text-xs text-gray-500 mt-1">
                .xls, .xlsx 파일만 허용됩니다.
              </p>
              <input
                id="excel-upload-input"
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded text-green-600">
                  <LucideFileSpreadsheet size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                disabled={isSubmitting}
              >
                <LucideX size={20} />
              </button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
            {isSubmitting ? "업로드 중..." : "업로드"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
