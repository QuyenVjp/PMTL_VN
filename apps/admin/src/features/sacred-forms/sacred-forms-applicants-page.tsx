import { useState } from "react";
import { SacredFormApplicantsTable } from "./sacred-forms-applicants-table.js";
import { ReviewDialog, type ReviewDialogState } from "./sacred-forms-review-dialog.js";
import type { ApplicantListItem } from "./types.js";

type ReviewDialogType = "APPROVE" | "REJECT" | "PROBATION" | null;

export function SacredFormApplicantsPage() {
  const [dialogState, setDialogState] = useState<ReviewDialogState>({
    type: null,
    applicant: null,
  });

  function openDialog(type: ReviewDialogType, applicant: ApplicantListItem) {
    setDialogState({ type, applicant });
  }

  function closeDialog() {
    setDialogState({ type: null, applicant: null });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đơn đăng ký Pháp Bảo</h1>
        <p className="mt-2 text-sm text-muted-foreground">Xét duyệt đơn đăng ký của các đồng tu</p>
      </div>
      <SacredFormApplicantsTable onAction={openDialog} />
      <ReviewDialog state={dialogState} onClose={closeDialog} />
    </div>
  );
}
