import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { lifeReleaseListOptions, speciesSummaryOptions } from "./queries.js";
import {
  LIFE_RELEASE_STATUS_LABELS,
  RECORD_TYPE_LABELS,
  STATUS_VARIANT,
  SPECIES_LABELS,
  type LifeReleaseListItem,
  type LifeReleaseStatus,
  type SpeciesSummaryItem,
} from "./types.js";
import { useUpdateLifeReleaseStatus } from "./mutations.js";

// ─── Status Transition Map ────────────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<LifeReleaseStatus, LifeReleaseStatus[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

// ─── Update Status Dialog ─────────────────────────────────────────────────────

interface UpdateStatusDialogProps {
  record: LifeReleaseListItem | null;
  onClose: () => void;
}

function UpdateStatusDialog({ record, onClose }: UpdateStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<LifeReleaseStatus | "">("");
  const [notes, setNotes] = useState("");
  const updateStatus = useUpdateLifeReleaseStatus();

  const availableTransitions = record ? STATUS_TRANSITIONS[record.status] : [];

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setNewStatus("");
      setNotes("");
      onClose();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!record || !newStatus) return;

    updateStatus.mutate(
      { publicId: record.id, status: newStatus, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          setNewStatus("");
          setNotes("");
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={record !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái hồ sơ phóng sinh</DialogTitle>
        </DialogHeader>
        {record && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Trạng thái hiện tại</p>
              <Badge variant={STATUS_VARIANT[record.status]}>
                {LIFE_RELEASE_STATUS_LABELS[record.status]}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newStatus">
                Trạng thái mới <span className="text-destructive">*</span>
              </Label>
              {availableTransitions.length > 0 ? (
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as LifeReleaseStatus)}
                >
                  <SelectTrigger id="newStatus">
                    <SelectValue placeholder="Chọn trạng thái mới" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTransitions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LIFE_RELEASE_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Hồ sơ này không thể chuyển sang trạng thái khác.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Lý do (tùy chọn)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập lý do thay đổi trạng thái (tùy chọn)"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={!newStatus || availableTransitions.length === 0 || updateStatus.isPending}
              >
                {updateStatus.isPending ? "Đang lưu..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

function LifeReleaseRowActions({
  row,
  onUpdateStatus,
}: {
  row: LifeReleaseListItem;
  onUpdateStatus: (record: LifeReleaseListItem) => void;
}) {
  const actions = [
    {
      label: "Cập nhật trạng thái",
      onClick: () => onUpdateStatus(row),
    },
  ];

  return <WorkspaceRowActions actions={actions} />;
}

// ─── Life Release Records ─────────────────────────────────────────────────────

export function LifeReleaseListPage() {
  const [selectedRecord, setSelectedRecord] = useState<LifeReleaseListItem | null>(null);
  const { data: envelope, isLoading } = useQuery(lifeReleaseListOptions());
  const records = useMemo(() => envelope?.data ?? [], [envelope]);

  const columns: ColumnDef<LifeReleaseListItem>[] = useMemo(
    () => [
      { accessorKey: "user", header: "Người phóng sinh", cell: ({ row }) => row.original.user?.name ?? "—" },
      {
        accessorKey: "recordType",
        header: "Loại",
        cell: ({ row }) => RECORD_TYPE_LABELS[row.original.recordType],
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]}>
            {LIFE_RELEASE_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      { accessorKey: "totalAnimals", header: "Tổng số lượng" },
      { accessorKey: "locationName", header: "Địa điểm", cell: ({ row }) => row.original.locationName ?? "—" },
      {
        accessorKey: "releaseDate",
        header: "Ngày phóng sinh",
        cell: ({ row }) => new Date(row.original.releaseDate).toLocaleDateString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <LifeReleaseRowActions row={row.original} onUpdateStatus={setSelectedRecord} />
        ),
      },
    ],
    []
  );

  const table = useSafeReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ phóng sinh</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý các hồ sơ phóng sinh của đồng tu</p>
      </div>
      <WorkspaceDataTable table={table} columns={columns} isLoading={isLoading} emptyMessage="Chưa có hồ sơ phóng sinh nào." />

      <UpdateStatusDialog record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}

// ─── Species Summary ──────────────────────────────────────────────────────────

const speciesColumns: ColumnDef<SpeciesSummaryItem>[] = [
  { accessorKey: "species", header: "Loài", cell: ({ row }) => SPECIES_LABELS[row.original.species] },
  { accessorKey: "totalReleased", header: "Tổng số đã phóng sinh" },
];

export function SpeciesSummaryPage() {
  const { data: envelope, isLoading } = useQuery(speciesSummaryOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: items,
    columns: speciesColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thống kê theo loài</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tổng số lượng sinh vật đã được phóng sinh theo loài</p>
      </div>
      <WorkspaceDataTable table={table} columns={speciesColumns} isLoading={isLoading} emptyMessage="Chưa có dữ liệu thống kê." />
    </div>
  );
}
