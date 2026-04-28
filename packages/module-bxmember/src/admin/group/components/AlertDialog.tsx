import { LucideAlertTriangle, LucideX } from "lucide-react";

interface AlertDialogProps {
    open: boolean;
    title?: string;
    message: string;
    onClose: () => void;
}

export function AlertDialog({ open, title = "알림", message, onClose }: AlertDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <LucideAlertTriangle size={18} className="text-yellow-500" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <LucideX size={18} />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{message}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
