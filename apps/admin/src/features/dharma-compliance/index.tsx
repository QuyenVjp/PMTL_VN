import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { fraudAlertListOptions, vowListOptions, charityListOptions, guidanceQueueOptions } from "./queries.js";
import {
  CHARITY_STATUS_LABELS,
  FRAUD_SEVERITY_LABELS,
  FRAUD_SEVERITY_VARIANT,
  VOW_STATUS_LABELS,
  GUIDANCE_URGENCY_VARIANT,
  type CharityListItem,
  type FraudAlertItem,
  type VowListItem,
  type GuidanceQueueItem,
} from "./types.js";

// ─── Charities ────────────────────────────────────────────────────────────────

const charityColumns: ColumnDef<CharityListItem>[] = [
  { accessorKey: "name", header: "Tên tổ chức" },
  { accessorKey: "charityType", header: "Loại" },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <Badge variant="outline">{CHARITY_STATUS_LABELS[row.original.status]}</Badge>,
  },
  { accessorKey: "registrationNumber", header: "Mã đăng ký" },
  { accessorKey: "contactEmail", header: "Email" },
];

export function CharitiesPage() {
  const { data: envelope, isLoading } = useQuery(charityListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({ data: items, columns: charityColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổ chức từ thiện</h1>
        <p className="mt-2 text-sm text-muted-foreground">Danh sách tổ chức từ thiện đã đăng ký</p>
      </div>
      <WorkspaceDataTable table={table} columns={charityColumns} isLoading={isLoading} emptyMessage="Chưa có tổ chức nào." />
    </div>
  );
}

// ─── Fraud Alerts ─────────────────────────────────────────────────────────────

const fraudColumns: ColumnDef<FraudAlertItem>[] = [
  { accessorKey: "charity", header: "Tổ chức", cell: ({ row }) => row.original.charity?.name ?? "—" },
  { accessorKey: "alertType", header: "Loại cảnh báo" },
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
    accessorKey: "resolved",
    header: "Đã xử lý",
    cell: ({ row }) => (
      <Badge variant={row.original.resolved ? "secondary" : "destructive"}>
        {row.original.resolved ? "Đã xử lý" : "Chưa xử lý"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
  },
];

export function FraudAlertsPage() {
  const { data: envelope, isLoading } = useQuery(fraudAlertListOptions({ resolved: false }));
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({ data: items, columns: fraudColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cảnh báo gian lận</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hàng đợi cảnh báo cần xử lý</p>
      </div>
      <WorkspaceDataTable table={table} columns={fraudColumns} isLoading={isLoading} emptyMessage="Không có cảnh báo nào." />
    </div>
  );
}

// ─── Purity Vows ──────────────────────────────────────────────────────────────

const vowColumns: ColumnDef<VowListItem>[] = [
  { accessorKey: "practitioner", header: "Người nguyện", cell: ({ row }) => row.original.practitioner?.name ?? "—" },
  { accessorKey: "purityLevel", header: "Mức độ thanh tịnh" },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant="outline">
        {VOW_STATUS_LABELS[row.original.status as keyof typeof VOW_STATUS_LABELS] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "vowDate",
    header: "Ngày nguyện",
    cell: ({ row }) => new Date(row.original.vowDate).toLocaleDateString("vi-VN"),
  },
];

export function PurityVowsPage() {
  const { data: envelope, isLoading } = useQuery(vowListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({ data: items, columns: vowColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lời nguyện thanh tu</h1>
        <p className="mt-2 text-sm text-muted-foreground">Danh sách lời nguyện thanh tu của các đồng tu</p>
      </div>
      <WorkspaceDataTable table={table} columns={vowColumns} isLoading={isLoading} emptyMessage="Chưa có lời nguyện nào." />
    </div>
  );
}

// ─── Guidance Queue ───────────────────────────────────────────────────────────

const guidanceColumns: ColumnDef<GuidanceQueueItem>[] = [
  { accessorKey: "practitioner", header: "Đồng tu", cell: ({ row }) => row.original.practitioner ?? "—" },
  { accessorKey: "category", header: "Danh mục" },
  {
    accessorKey: "question",
    header: "Câu hỏi",
    cell: ({ row }) => <span className="line-clamp-2">{row.original.question}</span>,
  },
  {
    accessorKey: "urgency",
    header: "Mức độ",
    cell: ({ row }) => (
      <Badge variant={GUIDANCE_URGENCY_VARIANT[row.original.urgency]}>
        {row.original.urgency}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "ANSWERED" ? "secondary" : "outline"}>
        {row.original.status}
      </Badge>
    ),
  },
];

export function GuidanceQueuePage() {
  const { data: envelope, isLoading } = useQuery(guidanceQueueOptions({ status: "PENDING" }));
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({ data: items, columns: guidanceColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hàng đợi hướng dẫn</h1>
        <p className="mt-2 text-sm text-muted-foreground">Yêu cầu hướng dẫn Pháp từ các đồng tu</p>
      </div>
      <WorkspaceDataTable table={table} columns={guidanceColumns} isLoading={isLoading} emptyMessage="Không có yêu cầu nào." />
    </div>
  );
}
