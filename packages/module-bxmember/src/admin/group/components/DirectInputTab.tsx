import { useRef, useState } from "react";

interface DirectInputTabProps {
    groupId: string;
    onReload: () => void;
}

export function DirectInputTab({ groupId, onReload }: DirectInputTabProps) {
    const [isAdding, setIsAdding] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async () => {
        if (!formRef.current) return;
        const parent = formRef.current;
        const name = (parent.querySelector('input[name="direct_name"]') as HTMLInputElement).value;
        const phone = (parent.querySelector('input[name="direct_phone"]') as HTMLInputElement).value;
        const email = (parent.querySelector('input[name="direct_email"]') as HTMLInputElement).value;
        const memo = (parent.querySelector('textarea[name="direct_memo"]') as HTMLTextAreaElement).value;

        if (!name) {
            alert("이름을 입력해주세요.");
            return;
        }

        const formData = new FormData();
        // intent not needed
        formData.append("group_id", groupId);
        formData.append("type", "DIRECT");
        formData.append("snapshot_name", name);
        formData.append("snapshot_phone", phone);
        formData.append("snapshot_email", email);
        formData.append("memo", memo);
        formData.append("target_id", "0"); 

        setIsAdding(true);
        try {
            const res = await fetch("/admin/api/bxmember/groups/member-add", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                onReload();
                // Clear inputs
                const inputs = parent.querySelectorAll('input, textarea');
                inputs.forEach((input: any) => input.value = '');
            } else {
                alert(data.error || "실패했습니다.");
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
        } finally {
            setIsAdding(false);
        }
    };

    // addFetcher effect removed

    return (
        <div className="p-6 flex flex-col h-full overflow-y-auto" ref={formRef}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름 <span className="text-red-500">*</span></label>
                    <input name="direct_name" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="이름을 입력하세요" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                    <input name="direct_phone" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="010-0000-0000" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <input name="direct_email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="example@email.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                    <textarea name="direct_memo" className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 resize-none" placeholder="비고 사항을 입력하세요"></textarea>
                </div>
            </div>
            <div className="mt-6">
                <button 
                    onClick={handleSubmit}
                    disabled={isAdding}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isAdding ? "추가 중..." : "추가하기"}
                </button>
            </div>
        </div>
    );
}
