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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lhListOptions, lhFraudListOptions } from "./queries.js";
import { useAdvanceLhStatus, useFlagLhFraud, useResolveLhFraud } from "./mutations.js";
import {
  LH_STATUS_LABELS,
  LH_STATUS_VARIANT,
  FRAUD_SEVERITY_LABELS,
  FRAUD_SEVERITY_VARIANT,
  NEXT_STATES,
  type LhListItem,
  type LhFraudItem,
  type LhStatus,
} from "./types.js";

// ─── Action Labels per transition ─────────────────────────────────────────────

const ADVANCE_ACTION_LABELS: Partial<Record<LhStatus, string>> = {
  SIGNED: "Ký nhận",
  CHANTED: "Hoàn thành tụng",
  BURNED: "Ghi nhận đốt",
  CANCELLED: "Huỷ",
};

// ─── Status Advance Dialog ─────────────────────────────────────────────────────

interface AdvanceDialogProps {
  open: boolean;
  onClose: () => void;
  item: LhListItem | null;
  targetStatus: LhStatus | null;
}

function AdvanceDialog({ open, onClose, item, targetStatus }: AdvanceDialogProps) {
  const mutation = useAdvanceLhStatus();

  function handleConfirm() {
    if (!item || !targetStatus) return;
    mutation.mutate(
      { publicId: item.id, status: targetStatus },
      { onSuccess: onClose },
    );
  }

  const actionLabel = targetStatus ? (ADVANCE_ACTION_LABELS[targetStatus] ?? targetStatus) : "";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận {actionLabel.toLowerCase()}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Hồ sơ sớ của <strong>{item?.beneficiaryName}</strong> sẽ được chuyển sang trạng thái{" "}
          <strong>{targetStatus ? LH_STATUS_LABELS[targetStatus] : ""}</strong>.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mutation.isPending}
            variant={targetStatus === "CANCELLED" ? "destructive" : "default"}
          >
            {mutation.isPending ? "Đang xử lý…" : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Fraud Flag Dialog ─────────────────────────────────────────────────────────

interface FraudFlagDialogProps {
  open: boolean;
  onClose: () => void;
  item: LhListItem | null;
}

function FraudFlagDialog({ open, onClose, item }: FraudFlagDialogProps) {
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState<string>("");
  const mutation = useFlagLhFraud();

  function handleClose() {
    setReason("");
    setSeverity("");
    onClose();
  }

  function handleConfirm() {
    if (!item || !reason.trim() || !severity) return;
    mutation.mutate(
      { publicId: item.id, reason: reason.trim(), severity },
      { onSuccess: handleClose },
    );
  }

  const isValid = reason.trim().length > 0 && severity.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đánh dấu gian lận</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fraud-reason">
              Lý do <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="fraud-reason"
              placeholder="Mô tả lý do phát hiện gian lận…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fraud-severity">
              Mức độ <span className="text-destructive">*</span>
            </Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger id="fraud-severity">
                <SelectValue placeholder="Chọn mức độ…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Nhẹ</SelectItem>
                <SelectItem value="MEDIUM">Trung bình</SelectItem>
                <SelectItem value="HIGH">Nghiêm trọng</SelectItem>
                <SelectItem value="CRITICAL">Nghiêm trọng nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? "Đang xử lý…" : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── LH Records ───────────────────────────────────────────────────────────────

function LhRecordRowActions({ item }: { item: LhListItem }) {
  const [advanceTarget, setAdvanceTarget] = useState<LhStatus | null>(null);
  const [showFraudDialog, setShowFraudDialog] = useState(false);

  const nextStates = NEXT_STATES[item.status];
  const isTerminal = nextStates.length === 0;

  const actions = [
    ...nextStates.map((s) => ({
      label: ADVANCE_ACTION_LABELS[s] ?? s,
      onClick: () => setAdvanceTarget(s),
      variant: s === "CANCELLED" ? ("destructive" as const) : ("default" as const),
      separator: s === "CANCELLED" && nextStates.length > 1,
    })),
    {
      label: "Đánh dấu gian lận",
      onClick: () => setShowFraudDialog(true),
      separator: !isTerminal,
      variant: "destructive" as const,
    },
  ];

  if (isTerminal) {
    return (
      <>
        <WorkspaceRowActions
          actions={[
            {
              label: "Đánh dấu gian lận",
              onClick: () => setShowFraudDialog(true),
              variant: "destructive",
            },
          ]}
        />
        <FraudFlagDialog open={showFraudDialog} onClose={() => setShowFraudDialog(false)} item={item} />
      </>
    );
  }

  return (
    <>
      <WorkspaceRowActions actions={actions} />
      <AdvanceDialog
        open={advanceTarget !== null}
        onClose={() => setAdvanceTarget(null)}
        item={item}
        targetStatus={advanceTarget}
      />
      <FraudFlagDialog
        open={showFraudDialog}
        onClose={() => setShowFraudDialog(false)}
        item={item}
      />
    </>
  );
}

const lhColumns: ColumnDef<LhListItem>[] = [
  { accessorKey: "beneficiaryName", header: "Tên người thụ hưởng" },
  { accessorKey: "user", header: "Người lập sớ", cell: ({ row }) => row.original.user?.name ?? "—" },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={LH_STATUS_VARIANT[row.original.status]}>
        {LH_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: "signedAt",
    header: "Ngày ký",
    cell: ({ row }) => row.original.signedAt ? new Date(row.original.signedAt).toLocaleDateString("vi-VN") : "—",
  },
  {
    accessorKey: "chantedAt",
    header: "Ngày tụng",
    cell: ({ row }) => row.original.chantedAt ? new Date(row.original.chantedAt).toLocaleDateString("vi-VN") : "—",
  },
  {
    accessorKey: "burnedAt",
    header: "Ngày hóa",
    cell: ({ row }) => row.original.burnedAt ? new Date(row.original.burnedAt).toLocaleDateString("vi-VN") : "—",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <LhRecordRowActions item={row.original} />,
  },
];

export function LhRecordsPage() {
  const { data: envelope, isLoading } = useQuery(lhListOptions());
  const records = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: records,
    columns: lhColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Danh sách sớ</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý hồ sơ Ngôi Nhà Nhỏ (sớ)</p>
      </div>
      <WorkspaceDataTable table={table} columns={lhColumns} isLoading={isLoading} emptyMessage="Chưa có sớ nào." />
    </div>
  );
}

// ─── Fraud Queue ──────────────────────────────────────────────────────────────

interface ResolveDialogProps {
  open: boolean;
  onClose: () => void;
  item: LhFraudItem | null;
}

function ResolveDialog({ open, onClose, item }: ResolveDialogProps) {
  const [resolution, setResolution] = useState("");
  const mutation = useResolveLhFraud();

  function handleClose() {
    setResolution("");
    onClose();
  }

  function handleConfirm() {
    if (!item || !resolution.trim()) return;
    mutation.mutate(
      { fraudId: item.id, resolution: resolution.trim() },
      { onSuccess: handleClose },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giải quyết gian lận</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="resolution-notes">
            Ghi chú xử lý <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="resolution-notes"
            placeholder="Mô tả biện pháp và kết quả xử lý…"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!resolution.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Đang xử lý…" : "Xác nhận giải quyết"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FraudQueueRowActions({ item }: { item: LhFraudItem }) {
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  if (item.resolvedAt) return null;

  return (
    <>
      <WorkspaceRowActions
        actions={[
          {
            label: "Giải quyết",
            onClick: () => setShowResolveDialog(true),
          },
        ]}
      />
      <ResolveDialog
        open={showResolveDialog}
        onClose={() => setShowResolveDialog(false)}
        item={item}
      />
    </>
  );
}

const fraudColumns: ColumnDef<LhFraudItem>[] = [
  { accessorKey: "record", header: "Hồ sơ sớ", cell: ({ row }) => row.original.record?.beneficiary ?? "—" },
  { accessorKey: "reason", header: "Lý do", cell: ({ row }) => <span className="line-clamp-2">{row.original.reason}</span> },
  {
    accessorKey: "severity",
    header: "Mức độ",
    cell: ({ row }) => (
      <Badge variant={FRAUD_SEVERITY_VARIANT[row.original.severity]}>
        {FRAUD_SEVERITY_LABELS[row.original.severity]}
      </Badge>
    ),
  },
  {
    accessorKey: "resolvedAt",
    header: "Đã xử lý",
    cell: ({ row }) => (
      <Badge variant={row.original.resolvedAt ? "secondary" : "destructive"}>
        {row.original.resolvedAt ? "Đã xử lý" : "Chưa xử lý"}
      </Badge>
    ),
  },
  {
    accessorKey: "flaggedAt",
    header: "Ngày phát hiện",
    cell: ({ row }) => new Date(row.original.flaggedAt).toLocaleDateString("vi-VN"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <FraudQueueRowActions item={row.original} />,
  },
];

export function LhFraudQueuePage() {
  const { data: envelope, isLoading } = useQuery(lhFraudListOptions({ resolved: false }));
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: items,
    columns: fraudColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hàng đợi gian lận sớ</h1>
        <p className="mt-2 text-sm text-muted-foreground">Các hồ sơ sớ bị gắn cờ gian lận cần xử lý</p>
      </div>
      <WorkspaceDataTable table={table} columns={fraudColumns} isLoading={isLoading} emptyMessage="Không có hồ sơ gian lận nào." />
    </div>
  );
}
