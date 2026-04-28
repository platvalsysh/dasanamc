import React, { useState, useRef, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    Button,
} from "@repo/ui-admin";
import { LucideDownload, LucideUpload, LucideTrash2, LucidePlus, LucideUserPlus } from "lucide-react";
import * as XLSX from "xlsx";
import { useFetcher } from "react-router";

interface EmeritusRow {
    seq?: string;
    name_kor: string;
    email: string;
    cellphone_number: string;
}

interface ExcelUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExcelUploadDialog({ open, onOpenChange }: ExcelUploadDialogProps) {
    const fetcher = useFetcher();
    const [rows, setRows] = useState<EmeritusRow[]>([
        { name_kor: "", email: "", cellphone_number: "" },
        { name_kor: "", email: "", cellphone_number: "" },
        { name_kor: "", email: "", cellphone_number: "" },
        { name_kor: "", email: "", cellphone_number: "" },
        { name_kor: "", email: "", cellphone_number: "" },
    ]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isSubmitting = fetcher.state === "submitting";

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
           const responseProxy = fetcher.data as any;
           if (!responseProxy.error && responseProxy.success) {
              alert(`성공적으로 처리되었습니다. (처리 건수: ${responseProxy.count})`);
              onOpenChange(false);
              setRows([
                  { name_kor: "", email: "", cellphone_number: "" },
                  { name_kor: "", email: "", cellphone_number: "" },
                  { name_kor: "", email: "", cellphone_number: "" },
                  { name_kor: "", email: "", cellphone_number: "" },
                  { name_kor: "", email: "", cellphone_number: "" },
              ]);
              window.location.reload();
           } else if (responseProxy.error) {
               alert(`업로드 실패: ${responseProxy.error || responseProxy.message || "Unknown error"}`);
           }
        }
    }, [fetcher.state, fetcher.data, onOpenChange]);

    const handleAddRow = () => {
        setRows([...rows, { name_kor: "", email: "", cellphone_number: "" }]);
    };

    const handleRemoveRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows.length > 0 ? newRows : [{ name_kor: "", email: "", cellphone_number: "" }]);
    };

    const handleInputChange = (index: number, field: keyof EmeritusRow, value: string) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        setRows(newRows);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;

        const lines = pasteData.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length === 0) return;

        const newRowsFromPaste = lines.map(line => {
            const cells = line.split('\t');
            // Assuming pasted data structure: [seq(optional), name_kor, email, cellphone_number]
            // Standard paste without seq will just map first column to name_kor.
            // Let's simply map columns 0-2 to name, email, phone, since users mostly copy those 3.
            return {
                seq: "",
                name_kor: (cells[0] || "").trim(),
                email: (cells[1] || "").trim(),
                cellphone_number: (cells[2] || "").trim()
            };
        });

        const validPastedRows = newRowsFromPaste.filter(r => r.name_kor);
        if (validPastedRows.length === 0) return;

        const isCurrentEmpty = rows.length <= 1 && !rows[0].seq && !rows[0].name_kor && !rows[0].email && !rows[0].cellphone_number;
        if (isCurrentEmpty) {
            setRows(validPastedRows);
        } else {
            const currentFilledRows = rows.filter(r => r.seq || r.name_kor || r.email || r.cellphone_number);
            setRows([...currentFilledRows, ...validPastedRows]);
        }
    };

    const handleDownloadTemplate = () => {
        const header = ["번호(수정시유지)", "이름*", "이메일", "전화번호"];
        const data = [
            header,
            ["", "홍길동", "hong@example.com", "010-1234-5678"],
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "명예교수 데이터");
        
        ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 }];
        
        XLSX.writeFile(wb, "명예교수_관리_양식.xlsx");
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

                const newRowsFromFile = data.slice(1)
                    .filter(row => row.length > 0 && (row[0] || row[1]))
                    .map(row => ({
                        seq: String(row[0] || "").trim(),
                        name_kor: String(row[1] || "").trim(),
                        email: String(row[2] || "").trim(),
                        cellphone_number: String(row[3] || "").trim()
                    }));

                if (newRowsFromFile.length > 0) {
                    setRows(newRowsFromFile);
                } else {
                    alert("업로드할 수 있는 유효한 데이터가 없습니다.");
                }
            } catch (error) {
                console.error("File read error:", error);
                alert("파일을 읽는 중 오류가 발생했습니다.");
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsBinaryString(file);
    };

    const handleSubmit = () => {
        const validRows = rows.filter(r => r.name_kor.trim() !== "");
        if (validRows.length === 0) {
            alert("입력된 명예교수 이름이 없습니다.");
            return;
        }

        // Generate Excel file to match backend expectations (seq, name_kor, email, cellphone_number)
        const wsData = [
            ["seq", "name_kor", "email", "cellphone_number"], // header is ignored by backend logic but required for length check
            ...validRows.map(r => [r.seq, r.name_kor, r.email, r.cellphone_number])
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const file = new File([blob], "upload.xlsx", { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const formData = new FormData();
        formData.append("file", file);

        fetcher.submit(formData, {
            method: "POST",
            encType: "multipart/form-data",
            action: "/admin/api/bxmember/emeritus/excel-upload",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-lg shadow-2xl">
                <DialogHeader className="p-6 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                <span className="bg-blue-50 p-2 rounded-lg">
                                    <LucideUserPlus className="text-blue-600" size={24} />
                                </span>
                                엑셀로 명예교수 관리
                            </DialogTitle>
                            <p className="text-sm text-gray-500">데이터를 직접 입력하거나 엑셀 파일 업로드(또는 복사-붙여넣기)를 통해 등록/수정할 수 있습니다.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="h-9 border-gray-200 hover:bg-gray-50">
                                <LucideDownload size={14} className="mr-2" />
                                양식 다운로드
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleUploadClick} className="h-9 border-gray-200 hover:bg-gray-50">
                                <LucideUpload size={14} className="mr-2" />
                                엑셀 파일 리딩
                            </Button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept=".xlsx, .xls, .csv" 
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div 
                    className="flex-1 overflow-auto p-6 bg-gray-50/30"
                    onPaste={handlePaste}
                >
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200 text-xs text-left">
                                <tr>
                                    <th className="px-4 py-3 text-center border-r border-gray-200 w-24 bg-gray-50">데이터 연동 Key (업데이트 시)</th>
                                    <th className="px-4 py-3 text-left border-r border-gray-200">이름 <span className="text-red-500">*</span></th>
                                    <th className="px-4 py-3 text-left border-r border-gray-200">이메일</th>
                                    <th className="px-4 py-3 text-left border-r border-gray-200">전화번호</th>
                                    <th className="px-4 py-3 text-center w-12">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/20 group transition-colors">
                                        <td className="p-0 border-r border-gray-200">
                                            <input 
                                                value={row.seq || ""} 
                                                onChange={(e) => handleInputChange(idx, 'seq', e.target.value)}
                                                className="w-full h-10 px-4 bg-transparent outline-none focus:bg-white focus:shadow-[inset_0_0_0_2px_#3b82f6] transition-all text-center text-gray-500"
                                                placeholder="ID"
                                                readOnly
                                            />
                                        </td>
                                        <td className="p-0 border-r border-gray-200">
                                            <input 
                                                value={row.name_kor} 
                                                onChange={(e) => handleInputChange(idx, 'name_kor', e.target.value)}
                                                className="w-full h-10 px-4 bg-transparent outline-none focus:bg-white focus:shadow-[inset_0_0_0_2px_#3b82f6] transition-all"
                                                placeholder="이름 입력"
                                            />
                                        </td>
                                        <td className="p-0 border-r border-gray-200">
                                            <input 
                                                value={row.email} 
                                                onChange={(e) => handleInputChange(idx, 'email', e.target.value)}
                                                className="w-full h-10 px-4 bg-transparent outline-none focus:bg-white focus:shadow-[inset_0_0_0_2px_#3b82f6] transition-all"
                                                placeholder="example@email.com"
                                            />
                                        </td>
                                        <td className="p-0 border-r border-gray-200">
                                            <input 
                                                value={row.cellphone_number} 
                                                onChange={(e) => handleInputChange(idx, 'cellphone_number', e.target.value)}
                                                className="w-full h-10 px-4 bg-transparent outline-none focus:bg-white focus:shadow-[inset_0_0_0_2px_#3b82f6] transition-all"
                                                placeholder="010-0000-0000"
                                            />
                                        </td>
                                        <td className="px-2 py-0 text-center">
                                            <button 
                                                onClick={() => handleRemoveRow(idx)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="행 삭제"
                                            >
                                                <LucideTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button 
                            onClick={handleAddRow}
                            className="w-full py-4 text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 flex items-center justify-center gap-2 font-medium transition-all group border-t border-gray-100"
                        >
                            <LucidePlus size={18} className="group-hover:scale-110 transition-transform" /> 
                            데이터 행 추가하기
                        </button>
                    </div>
                </div>

                <DialogFooter className="p-6 border-t border-gray-100 bg-white shrink-0">
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            className="flex-1 sm:flex-none text-gray-500 hover:bg-gray-100"
                        >
                            취소
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-200 active:scale-95 transition-all h-10"
                        >
                            {isSubmitting ? "처리 중..." : "일괄 완료 (적용)"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
