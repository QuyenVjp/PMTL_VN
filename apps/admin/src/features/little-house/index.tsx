import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { lhListOptions, lhFraudListOptions } from "./queries.js";
import {
  LH_STATUS_LABELS,
  LH_STATUS_VARIANT,
  FRAUD_SEVERITY_LABELS,
  FRAUD_SEVERITY_VARIANT,
  type LhListItem,
  type LhFraudItem,
} from "./types.js";

// ─── LH Records ───────────────────────────────────────────────────────────────

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
