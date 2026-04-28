import React, { useState, useRef } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    Button,
    Input,
} from "@repo/ui-admin";
import { LucideDownload, LucideUpload, LucideTrash2, LucidePlus, LucideUserPlus } from "lucide-react";
import * as XLSX from "xlsx";

interface MemberRow {
    name: string;
    phone: string;
    email: string;
    memo: string;
}

interface GroupMemberExcelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: string;
    onSuccess: () => void;
}

export function GroupMemberExcelDialog({ open, onOpenChange, groupId, onSuccess }: GroupMemberExcelDialogProps) {
    const [rows, setRows] = useState<MemberRow[]>([
        { name: "", phone: "", email: "", memo: "" },
        { name: "", phone: "", email: "", memo: "" },
        { name: "", phone: "", email: "", memo: "" },
        { name: "", phone: "", email: "", memo: "" },
        { name: "", phone: "", email: "", memo: "" },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddRow = () => {
        setRows([...rows, { name: "", phone: "", email: "", memo: "" }]);
    };

    const handleRemoveRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows.length > 0 ? newRows : [{ name: "", phone: "", email: "", memo: "" }]);
    };

    const handleInputChange = (index: number, field: keyof MemberRow, value: string) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;

        const lines = pasteData.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length === 0) return;

        const newRowsFromPaste = lines.map(line => {
            const cells = line.split('\t'); // Excel uses tabs
            return {
                name: (cells[0] || "").trim(),
                phone: (cells[1] || "").trim(),
                email: (cells[2] || "").trim(),
                memo: (cells[3] || "").trim()
            };
        });

        // 이름이 하나라도 있는 데이터만 필터링
        const validPastedRows = newRowsFromPaste.filter(r => r.name);
        if (validPastedRows.length === 0) return;

        // 현재 첫 번째 행이 비어있으면 교체, 아니면 추가
        const isCurrentEmpty = rows.length <= 1 && !rows[0].name && !rows[0].phone && !rows[0].email && !rows[0].memo;
        if (isCurrentEmpty) {
            setRows(validPastedRows);
        } else {
            // 빈 행들은 제거하고 추가
            const currentFilledRows = rows.filter(r => r.name || r.phone || r.email || r.memo);
            setRows([...currentFilledRows, ...validPastedRows]);
        }
    };

    const handleDownloadTemplate = () => {
        const header = ["이름*", "전화번호", "이메일", "메모"];
        const data = [
            header,
            ["홍길동", "010-1234-5678", "hong@example.com", "심화과정 비고"],
            ["김철수", "010-9876-5432", "kim@example.com", "관리자 비고"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "구성원추가양식");
        
        // 컬럼 너비 설정
        ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 30 }];
        
        XLSX.writeFile(wb, "그룹구성원_추가_양식.xlsx");
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

                // 헤더 제외 및 유효 데이터 필터링 (최소 이름은 있어야 함)
                const newRowsFromFile = data.slice(1)
                    .filter(row => row.length > 0 && row[0])
                    .map(row => ({
                        name: String(row[0] || "").trim(),
                        phone: String(row[1] || "").trim(),
                        email: String(row[2] || "").trim(),
                        memo: String(row[3] || "").trim()
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

    const handleSubmit = async () => {
        const validRows = rows.filter(r => r.name.trim() !== "");
        if (validRows.length === 0) {
            alert("입력된 구성원 이름이 없습니다.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("group_id", groupId);
            formData.append("rows", JSON.stringify(validRows));

            const res = await fetch("/admin/api/bxmember/groups/member-add-excel", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                onSuccess();
                onOpenChange(false);
                setRows([
                    { name: "", phone: "", email: "", memo: "" },
                    { name: "", phone: "", email: "", memo: "" },
                    { name: "", phone: "", email: "", memo: "" },
                    { name: "", phone: "", email: "", memo: "" },
                    { name: "", phone: "", email: "", memo: "" },
                ]);
            } else {
                alert(data.error || "추가 실패");
            }
        } catch (e) {
            console.error(e);
            alert("네트워크 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
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
                                엑셀로 구성원 추가
                            </DialogTitle>
                            <p className="text-sm text-gray-500">데이터를 직접 입력하거나 엑셀에서 복사(Ctrl+C)하여 붙여넣기 할 수 있습니다.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="h-9 border-gray-200 hover:bg-gray-50">
                                <LucideDownload size={14} className="mr-2" />
                                양식 다운로드
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleUploadClick} className="h-9 border-gray-200 hover:bg-gray-50">
                                <LucideUpload size={14} className="mr-2" />
                                양식 업로드 (파일)
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
                            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200 text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-center border-r border-gray-200 w-12 bg-gray-50">번호</th>
                                    <th className="px-4 py-3 text-left border-r border-gray-200">이름 <span className="text-red-500">*</span></th>
                                    <th className="px-4 py-3 text-left border-r border-gray-200">전화번호</th>
                                    <th className="px-4 py-3 text-left border-r border-gray-200">이메일</th>
                                    <th className="px-4 py-3 text-left border-r border-gray-200">메모</th>
                                    <th className="px-4 py-3 text-center w-12">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/20 group transition-colors">
                                        <td className="px-4 py-3 text-center text-gray-400 font-medium bg-gray-50/50 border-r border-gray-200 text-xs">{idx + 1}</td>
                                        <td className="p-0 border-r border-gray-200">
                                            <input 
                                                value={row.name} 
                                                onChange={(e) => handleInputChange(idx, 'name', e.target.value)}
                                                className="w-full h-10 px-4 bg-transparent outline-none focus:bg-white focus:shadow-[inset_0_0_0_2px_#3b82f6] transition-all"
                                                placeholder="이름 입력"
                                            />
                                        </td>
                                        <td className="p-0 border-r border-gray-200">
                                            <input 
                                                value={row.phone} 
                                                onChange={(e) => handleInputChange(idx, 'phone', e.target.value)}
                                                className="w-full h-10 px-4 bg-transparent outline-none focus:bg-white focus:shadow-[inset_0_0_0_2px_#3b82f6] transition-all"
                                                placeholder="010-0000-0000"
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
                                                value={row.memo} 
                                                onChange={(e) => handleInputChange(idx, 'memo', e.target.value)}
                                                className="w-full h-10 px-4 bg-transparent outline-none focus:bg-white focus:shadow-[inset_0_0_0_2px_#3b82f6] transition-all"
                                                placeholder="비고 또는 메모"
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
                            {isSubmitting ? "처리 중..." : "일괄 추가 완료"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
