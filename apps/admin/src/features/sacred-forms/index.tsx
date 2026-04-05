import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { templateListOptions, applicantListOptions } from "./queries.js";
import {
  FORM_TYPE_LABELS,
  APPLICANT_STATUS_LABELS,
  APPLICANT_STATUS_VARIANT,
  type TemplateListItem,
  type ApplicantListItem,
} from "./types.js";

// ─── Templates ────────────────────────────────────────────────────────────────

const templateColumns: ColumnDef<TemplateListItem>[] = [
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
];

export function SacredFormTemplatesPage() {
  const { data: envelope, isLoading } = useQuery(templateListOptions());
  const templates = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: templates,
    columns: templateColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mẫu đơn Pháp Bảo</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý các mẫu đơn đăng ký</p>
      </div>
      <WorkspaceDataTable table={table} columns={templateColumns} isLoading={isLoading} emptyMessage="Chưa có mẫu đơn nào." />
    </div>
  );
}

// ─── Applicants ───────────────────────────────────────────────────────────────

const applicantColumns: ColumnDef<ApplicantListItem>[] = [
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
];

export function SacredFormApplicantsPage() {
  const { data: envelope, isLoading } = useQuery(applicantListOptions());
  const applicants = useMemo(() => envelope?.data ?? [], [envelope]);

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
    </div>
  );
}
