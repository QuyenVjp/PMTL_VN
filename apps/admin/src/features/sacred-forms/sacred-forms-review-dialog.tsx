import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReviewApplication } from "./mutations.js";
import { type ApplicantListItem } from "./types.js";

type ReviewDialogType = "APPROVE" | "REJECT" | "PROBATION" | null;

export interface ReviewDialogState {
  type: ReviewDialogType;
  applicant: ApplicantListItem | null;
}

export function ReviewDialog({
  state,
  onClose,
}: {
  state: ReviewDialogState;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");
  const review = useReviewApplication();

  const { type, applicant } = state;

  const titleMap: Record<NonNullable<ReviewDialogType>, string> = {
    APPROVE: "Duyệt đơn đăng ký",
    REJECT: "Từ chối đơn đăng ký",
    PROBATION: "Thử thách đơn đăng ký",
  };

  const notesLabelMap: Record<NonNullable<ReviewDialogType>, string> = {
    APPROVE: "Ghi chú (tuỳ chọn)",
    REJECT: "Lý do từ chối",
    PROBATION: "Ghi chú thử thách (tuỳ chọn)",
  };

  const confirmLabelMap: Record<NonNullable<ReviewDialogType>, string> = {
    APPROVE: "Xác nhận duyệt",
    REJECT: "Xác nhận từ chối",
    PROBATION: "Xác nhận thử thách",
  };

  if (!type || !applicant) return null;

  const isRequired = type === "REJECT";

  function handleConfirm() {
    if (!applicant || !type) return;
    if (isRequired && !notes.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    review.mutate(
      {
        publicId: applicant.id,
        decision: type,
        reviewNotes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNotes("");
          onClose();
        },
      },
    );
  }

  return (
    <Dialog open={!!type} onOpenChange={(open) => { if (!open) { setNotes(""); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titleMap[type]}</DialogTitle>
          <DialogDescription>
            Đồng tu: <strong>{applicant.user?.name ?? "—"}</strong>
            {" · "}
            Mẫu đơn: <strong>{applicant.template?.titleVi ?? "—"}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="review-notes">
            {notesLabelMap[type]}
            {isRequired && <span className="ml-1 text-destructive">*</span>}
          </Label>
          <Textarea
            id="review-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRequired ? "Nhập lý do từ chối..." : "Nhập ghi chú (nếu có)..."}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setNotes(""); onClose(); }}>
            Huỷ
          </Button>
          <Button
            variant={type === "REJECT" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={review.isPending}
          >
            {review.isPending ? "Đang xử lý..." : confirmLabelMap[type]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
