import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@repo/ui-admin";
import { Button } from "@repo/ui-admin";
import { Input } from "@repo/ui-admin";
import { useState } from "react";
import { useFetcher } from "react-router";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  memberSeq: number;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  memberName,
  memberSeq,
}: DeleteConfirmDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const fetcher = useFetcher();

  const isConfirmed = confirmName === memberName;
  const isDeleting = fetcher.state === "submitting";

  const handleDelete = () => {
    if (!isConfirmed) return;
    
    fetcher.submit(
      { intent: "delete", seq: memberSeq.toString() },
      { method: "post" }
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>회원 삭제 확인</DialogTitle>
          <DialogDescription>
            정말로 <strong>{memberName}</strong> 회원을 삭제하시겠습니까?
            <br />
            삭제를 확인하려면 아래 입력창에 <strong>{memberName}</strong>을(를)
            입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={confirmName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmName(e.target.value)}
            placeholder={`${memberName} 입력`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            variant="destructive"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
