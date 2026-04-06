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
import { altarItemListOptions, validationLogListOptions } from "./queries.js";
import { useUpdateAltarCondition } from "./mutations.js";
import {
  ALTAR_ITEM_TYPE_LABELS,
  CONDITION_LABELS,
  CONDITION_VARIANT,
  PROTOCOL_LABELS,
  type AltarItemListItem,
  type ValidationLogItem,
} from "./types.js";

// ─── Condition Update Dialog ──────────────────────────────────────────────────

interface ConditionUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  item: AltarItemListItem | null;
}

function ConditionUpdateDialog({ open, onClose, item }: ConditionUpdateDialogProps) {
  const [condition, setCondition] = useState<string>("");
  const [notes, setNotes] = useState("");
  const mutation = useUpdateAltarCondition();

  function handleClose() {
    setCondition("");
    setNotes("");
    onClose();
  }

  function handleConfirm() {
    if (!item || !condition) return;
    mutation.mutate(
      { publicId: item.id, condition, notes: notes.trim() || undefined },
      { onSuccess: handleClose },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật tình trạng vật phẩm</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition-select">
              Tình trạng mới <span className="text-destructive">*</span>
            </Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger id="condition-select">
                <SelectValue placeholder="Chọn tình trạng…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">Tốt</SelectItem>
                <SelectItem value="NEEDS_ATTENTION">Cần chú ý</SelectItem>
                <SelectItem value="REQUIRES_REPLACEMENT">Cần thay thế</SelectItem>
                <SelectItem value="RETIRED">Đã ngưng dùng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition-notes">Ghi chú</Label>
            <Textarea
              id="condition-notes"
              placeholder="Ghi chú thêm về tình trạng vật phẩm (không bắt buộc)…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!condition || mutation.isPending}
          >
            {mutation.isPending ? "Đang lưu…" : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Altar Item Row Actions ───────────────────────────────────────────────────

function AltarItemRowActions({ item }: { item: AltarItemListItem }) {
  const [showConditionDialog, setShowConditionDialog] = useState(false);

  return (
    <>
      <WorkspaceRowActions
        actions={[
          {
            label: "Cập nhật tình trạng",
            onClick: () => setShowConditionDialog(true),
          },
        ]}
      />
      <ConditionUpdateDialog
        open={showConditionDialog}
        onClose={() => setShowConditionDialog(false)}
        item={item}
      />
    </>
  );
}

// ─── Altar Items ──────────────────────────────────────────────────────────────

const itemColumns: ColumnDef<AltarItemListItem>[] = [
  { accessorKey: "name", header: "Tên vật phẩm" },
  {
    accessorKey: "itemType",
    header: "Loại",
    cell: ({ row }) => ALTAR_ITEM_TYPE_LABELS[row.original.itemType],
  },
  {
    accessorKey: "condition",
    header: "Tình trạng",
    cell: ({ row }) => (
      <Badge variant={CONDITION_VARIANT[row.original.condition]}>
        {CONDITION_LABELS[row.original.condition]}
      </Badge>
    ),
  },
  { accessorKey: "user", header: "Chủ nhân", cell: ({ row }) => row.original.user?.name ?? "—" },
  {
    accessorKey: "isActive",
    header: "Đang dùng",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "secondary" : "outline"}>
        {row.original.isActive ? "Có" : "Không"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <AltarItemRowActions item={row.original} />,
  },
];

export function AltarItemsPage() {
  const { data: envelope, isLoading } = useQuery(altarItemListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: items,
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vật phẩm thờ cúng</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý vật phẩm trên bàn thờ</p>
      </div>
      <WorkspaceDataTable table={table} columns={itemColumns} isLoading={isLoading} emptyMessage="Chưa có vật phẩm nào." />
    </div>
  );
}

// ─── Validation Logs (read-only) ──────────────────────────────────────────────

const logColumns: ColumnDef<ValidationLogItem>[] = [
  { accessorKey: "user", header: "Người kiểm tra", cell: ({ row }) => row.original.user?.name ?? "—" },
  {
    accessorKey: "protocolType",
    header: "Quy trình",
    cell: ({ row }) => PROTOCOL_LABELS[row.original.protocolType],
  },
  {
    accessorKey: "passed",
    header: "Kết quả",
    cell: ({ row }) => (
      <Badge variant={row.original.passed ? "secondary" : "destructive"}>
        {row.original.passed ? "Đạt" : "Không đạt"}
      </Badge>
    ),
  },
  { accessorKey: "item", header: "Vật phẩm", cell: ({ row }) => row.original.item?.name ?? "—" },
  {
    accessorKey: "performedAt",
    header: "Ngày kiểm tra",
    cell: ({ row }) => new Date(row.original.performedAt).toLocaleDateString("vi-VN"),
  },
];

export function ValidationLogsPage() {
  const { data: envelope, isLoading } = useQuery(validationLogListOptions());
  const logs = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: logs,
    columns: logColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nhật ký kiểm tra thờ cúng</h1>
        <p className="mt-2 text-sm text-muted-foreground">Lịch sử kiểm tra vật phẩm và quy trình thờ cúng (chỉ đọc)</p>
      </div>
      <WorkspaceDataTable table={table} columns={logColumns} isLoading={isLoading} emptyMessage="Chưa có nhật ký nào." />
    </div>
  );
}
