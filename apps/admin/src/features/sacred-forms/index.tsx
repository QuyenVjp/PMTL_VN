import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { WorkspaceRowActions } from "@/components/workspace/workspace-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { templateListOptions, applicantListOptions } from "./queries.js";
import { useToggleTemplate, useReviewApplication } from "./mutations.js";
import {
  FORM_TYPE_LABELS,
  APPLICANT_STATUS_LABELS,
  APPLICANT_STATUS_VARIANT,
  type TemplateListItem,
  type ApplicantListItem,
} from "./types.js";

// ─── Templates ────────────────────────────────────────────────────────────────

function TemplateRowActions({ item }: { item: TemplateListItem }) {
  const toggle = useToggleTemplate();

  const actions = [
    {
      label: item.isActive ? "Tắt hoạt động" : "Kích hoạt",
      onClick: () => {
        toggle.mutate({ publicId: item.id, isActive: !item.isActive });
      },
    },
  ];

  return <WorkspaceRowActions actions={actions} />;
}

export function SacredFormTemplatesPage() {
  const { data: envelope, isLoading } = useQuery(templateListOptions());
  const templates = useMemo(() => envelope?.data ?? [], [envelope]);

  const templateColumns: ColumnDef<TemplateListItem>[] = useMemo(
    () => [
      { accessorKey: "titleVi", header: "Tên mẫu đơn" },
      {
        accessorKey: "formType",
        header: "Loại đơn",
        cell: ({ row }) => FORM_TYPE_LABELS[row.original.formType],
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "secondary" : "outline"}>
            {row.original.isActive ? "Đang hoạt động" : "Tạm dừng"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <TemplateRowActions item={row.original} />,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: templates,
    columns: templateColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mẫu đơn Pháp Bảo</h1>
          <p className="mt-2 text-sm text-muted-foreground">Quản lý các mẫu đơn đăng ký</p>
        </div>
        <Button
          onClick={() => toast.info("Tính năng đang phát triển")}
        >
          Tạo mẫu đơn
        </Button>
      </div>
      <WorkspaceDataTable table={table} columns={templateColumns} isLoading={isLoading} emptyMessage="Chưa có mẫu đơn nào." />
    </div>
  );
}

// ─── Applicants ───────────────────────────────────────────────────────────────

type ReviewDialogType = "APPROVE" | "REJECT" | "PROBATION" | null;

interface ReviewDialogState {
  type: ReviewDialogType;
  applicant: ApplicantListItem | null;
}

function ApplicantRowActions({
  item,
  onAction,
}: {
  item: ApplicantListItem;
  onAction: (type: ReviewDialogType, applicant: ApplicantListItem) => void;
}) {
  const canReview = item.status === "PENDING" || item.status === "UNDER_REVIEW";

  if (!canReview) return null;

  const actions = [
    {
      label: "Duyệt",
      onClick: () => onAction("APPROVE", item),
    },
    {
      label: "Từ chối",
      onClick: () => onAction("REJECT", item),
      variant: "destructive" as const,
    },
    {
      label: "Thử thách",
      onClick: () => onAction("PROBATION", item),
      separator: true,
    },
  ];

  return <WorkspaceRowActions actions={actions} />;
}

function ReviewDialog({
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

export function SacredFormApplicantsPage() {
  const { data: envelope, isLoading } = useQuery(applicantListOptions());
  const applicants = useMemo(() => envelope?.data ?? [], [envelope]);

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

  const applicantColumns: ColumnDef<ApplicantListItem>[] = useMemo(
    () => [
      { accessorKey: "user", header: "Đồng tu", cell: ({ row }) => row.original.user?.name ?? "—" },
      { accessorKey: "template", header: "Mẫu đơn", cell: ({ row }) => row.original.template?.titleVi ?? "—" },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={APPLICANT_STATUS_VARIANT[row.original.status]}>
            {APPLICANT_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "probationEndsAt",
        header: "Hết thử thách",
        cell: ({ row }) =>
          row.original.probationEndsAt
            ? new Date(row.original.probationEndsAt).toLocaleDateString("vi-VN")
            : "—",
      },
      {
        accessorKey: "createdAt",
        header: "Ngày nộp",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <ApplicantRowActions item={row.original} onAction={openDialog} />
        ),
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: applicants,
    columns: applicantColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đơn đăng ký Pháp Bảo</h1>
        <p className="mt-2 text-sm text-muted-foreground">Xét duyệt đơn đăng ký của các đồng tu</p>
      </div>
      <WorkspaceDataTable table={table} columns={applicantColumns} isLoading={isLoading} emptyMessage="Chưa có đơn đăng ký nào." />
      <ReviewDialog state={dialogState} onClose={closeDialog} />
    </div>
  );
}
