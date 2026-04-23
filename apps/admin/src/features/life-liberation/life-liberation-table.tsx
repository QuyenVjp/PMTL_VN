import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import {
  WorkspaceDataTable,
  WorkspaceRowActions,
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceDetailField,
} from "@/components/workspace";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { lifeReleaseListOptions } from "./queries.js";
import {
  LIFE_RELEASE_STATUS_LABELS,
  RECORD_TYPE_LABELS,
  STATUS_VARIANT,
  type LifeReleaseListItem,
  type LifeReleaseStatus,
} from "./types.js";
import { useUpdateLifeReleaseStatus } from "./mutations.js";

const STATUS_TRANSITIONS: Record<LifeReleaseStatus, LifeReleaseStatus[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

function UpdateStatusDialog({
  record,
  onClose,
}: {
  record: LifeReleaseListItem | null;
  onClose: () => void;
}) {
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
      },
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
                disabled={
                  !newStatus || availableTransitions.length === 0 || updateStatus.isPending
                }
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

export function LifeReleaseTable() {
  const [selectedRecord, setSelectedRecord] = useState<LifeReleaseListItem | null>(null);
  const [detailItem, setDetailItem] = useState<LifeReleaseListItem | null>(null);
  const { data: envelope, isLoading } = useQuery(lifeReleaseListOptions());
  const records = useMemo(() => envelope?.data ?? [], [envelope]);

  const canTransition = detailItem ? STATUS_TRANSITIONS[detailItem.status].length > 0 : false;

  function handleUpdateFromSheet() {
    if (!detailItem) return;
    const item = detailItem;
    setDetailItem(null);
    setSelectedRecord(item);
  }

  const columns: ColumnDef<LifeReleaseListItem>[] = useMemo(
    () => [
      {
        accessorKey: "user",
        header: "Người phóng sinh",
        cell: ({ row }) => row.original.user?.name ?? "—",
      },
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
      {
        accessorKey: "locationName",
        header: "Địa điểm",
        cell: ({ row }) => row.original.locationName ?? "—",
      },
      {
        accessorKey: "releaseDate",
        header: "Ngày phóng sinh",
        cell: ({ row }) => new Date(row.original.releaseDate).toLocaleDateString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <WorkspaceRowActions
            actions={[
              {
                label: "Xem chi tiết",
                onClick: () => setDetailItem(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có hồ sơ phóng sinh nào."
      />

      <WorkspaceDetailSheet
        open={detailItem !== null}
        onOpenChange={(v) => {
          if (!v) setDetailItem(null);
        }}
        title={detailItem?.user?.name ?? "Chưa xác định"}
        subtitle={detailItem ? RECORD_TYPE_LABELS[detailItem.recordType] : undefined}
        status={
          detailItem && (
            <Badge variant={STATUS_VARIANT[detailItem.status]}>
              {LIFE_RELEASE_STATUS_LABELS[detailItem.status]}
            </Badge>
          )
        }
        primaryActions={
          canTransition ? (
            <Button size="sm" onClick={handleUpdateFromSheet}>
              Cập nhật trạng thái
            </Button>
          ) : undefined
        }
      >
        {detailItem && (
          <WorkspaceDetailSection title="Thông tin hồ sơ">
            <WorkspaceDetailField
              label="Người phóng sinh"
              value={detailItem.user?.name ?? "—"}
            />
            <WorkspaceDetailField
              label="Loại hồ sơ"
              value={RECORD_TYPE_LABELS[detailItem.recordType]}
            />
            <WorkspaceDetailField
              label="Tổng số lượng"
              value={detailItem.totalAnimals}
            />
            <WorkspaceDetailField
              label="Địa điểm"
              value={detailItem.locationName ?? "—"}
            />
            <WorkspaceDetailField
              label="Ngày phóng sinh"
              value={new Date(detailItem.releaseDate).toLocaleDateString("vi-VN")}
            />
          </WorkspaceDetailSection>
        )}
      </WorkspaceDetailSheet>

      <UpdateStatusDialog
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </>
  );
}
