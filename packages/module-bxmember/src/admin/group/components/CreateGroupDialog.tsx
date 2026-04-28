import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea
} from "@repo/ui-admin";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (group: any) => void;
}

export function CreateGroupDialog({ open, onOpenChange, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    // formData.append("intent", "create_group"); // Not needed for dedicated endpoint

    try {
        const res = await fetch("/admin/api/bxmember/groups/create", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        
        if (data.success) {
            onOpenChange(false);
            onSuccess(data.group);
            form.reset();
        } else {
            alert(data.error || "그룹 생성에 실패했습니다.");
        }
    } catch (error) {
        console.error(error);
        alert("오류가 발생했습니다.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>그룹 생성</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">그룹명 <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" required placeholder="예: 2026 상반기 모임" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo">비고 (메모)</Label>
            <Textarea id="memo" name="memo" placeholder="그룹에 대한 설명이나 메모를 입력하세요" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
