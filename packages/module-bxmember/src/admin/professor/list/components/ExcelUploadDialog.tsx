import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-admin";
import { useFetcher } from "react-router";
import { useEffect, useState, useRef } from "react";
import { LucideUpload, LucideFileSpreadsheet, LucideX } from "lucide-react";

interface ExcelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExcelUploadDialog({ open, onOpenChange }: ExcelUploadDialogProps) {
  const fetcher = useFetcher();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = fetcher.state === "submitting";

  // console.log("Fetcher State:", fetcher.state);
  // console.log("Fetcher Data:", fetcher.data);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
       // console.log("Effect triggered with data:", fetcher.data);
       const responseProxy = fetcher.data;

       if (!responseProxy.error && responseProxy.data?.success) {
          alert(`성공적으로 업로드되었습니다. (처리 건수: ${responseProxy.data.count})`);
          setFile(null);
          onOpenChange(false);
          window.location.reload();
       } else if (responseProxy.error) {
          alert(`업로드 실패: ${responseProxy.message || "Unknown error"}`);
       } else {
          // Fallback
          console.log("Unexpected data structure:", responseProxy);
          alert("처리가 완료되었으나 응답을 확인할 수 없습니다.");
       }
    }
  }, [fetcher.state, fetcher.data, onOpenChange]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
      action: "/admin/api/bxmember/professor/excel-upload",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>교수 엑셀 업로드</DialogTitle>
          <DialogDescription>
            교수 목록 엑셀 파일을 업로드합니다. (.xls, .xlsx)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <LucideUpload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              클릭하거나 파일을 여기로 드래그하세요
            </p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".xls,.xlsx"
              onChange={handleChange}
            />
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-md">
              <div className="flex items-center gap-2">
                <LucideFileSpreadsheet size={20} />
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </span>
                <span className="text-xs text-blue-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-1 hover:bg-blue-100 rounded-full"
              >
                <LucideX size={16} />
              </button>
            </div>
          )}


        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "업로드 중..." : "업로드"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
