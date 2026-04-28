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
  group: any | null;
  onSuccess?: (group: any) => void;
}

export function EditGroupDialog({ open, onOpenChange, group, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    // formData.append("intent", "update_group"); // Not needed for dedicated endpoint
    formData.append("id", group.id);

    try {
        const res = await fetch("/admin/api/bxmember/groups/update", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        
        if (data.success) {
            onOpenChange(false);
            if (onSuccess && data.group) {
                onSuccess(data.group);
            }
        } else {
            alert(data.error || "그룹 수정에 실패했습니다.");
        }
    } catch (error) {
        console.error(error);
        alert("오류가 발생했습니다.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>그룹 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">그룹명 <span className="text-red-500">*</span></Label>
            <Input id="edit-name" name="name" required defaultValue={group.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-memo">비고 (메모)</Label>
            <Textarea 
                id="edit-memo" 
                name="memo" 
                defaultValue={(() => {
                    try {
                        const ev = group.extra_vars as any;
                        if (typeof ev === 'string') return JSON.parse(ev).memo;
                        return ev?.memo;
                    } catch { return ""; }
                })() || ""} 
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "수정 중..." : "수정"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
