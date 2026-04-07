import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { applicantListOptions, type ApplicantListItem } from "./queries.js";
import { APPLICANT_STATUS_LABELS, APPLICANT_STATUS_VARIANT, type ApplicantStatus } from "./types.js";

type ReviewDialogType = "APPROVE" | "REJECT" | "PROBATION" | null;

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

export function SacredFormApplicantsTable({
  onAction,
}: {
  onAction: (type: ReviewDialogType, applicant: ApplicantListItem) => void;
}) {
  const { data: envelope, isLoading } = useQuery(applicantListOptions());
  const applicants = useMemo(() => envelope?.data ?? [], [envelope]);

  const applicantColumns: ColumnDef<ApplicantListItem>[] = useMemo(
    () => [
      { accessorKey: "user", header: "Đồng tu", cell: ({ row }) => row.original.user?.name ?? "—" },
      { accessorKey: "template", header: "Mẫu đơn", cell: ({ row }) => row.original.template?.titleVi ?? "—" },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={APPLICANT_STATUS_VARIANT[row.original.status as ApplicantStatus]}>
            {APPLICANT_STATUS_LABELS[row.original.status as ApplicantStatus]}
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
          <ApplicantRowActions item={row.original} onAction={onAction} />
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
    <WorkspaceDataTable table={table} columns={applicantColumns} isLoading={isLoading} emptyMessage="Chưa có đơn đăng ký nào." />
  );
}
