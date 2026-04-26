import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import {
  WorkspaceDataTable,
  WorkspaceRowActions,
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceDetailStandardSections,
  WorkspaceDetailField,
} from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { applicantListOptions, type ApplicantListItem } from "./queries.js";
import {
  APPLICANT_STATUS_LABELS,
  APPLICANT_STATUS_VARIANT,
  FORM_TYPE_LABELS,
  type SacredFormType,
} from "./types.js";

type ReviewDialogType = "APPROVE" | "REJECT" | "PROBATION" | null;

export function SacredFormApplicantsTable({
  onAction,
}: {
  onAction: (type: ReviewDialogType, applicant: ApplicantListItem) => void;
}) {
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantListItem | null>(null);
  const { data: envelope, isLoading } = useQuery(applicantListOptions());
  const applicants = useMemo(() => envelope?.data ?? [], [envelope]);

  const canReview =
    selectedApplicant?.status === "PENDING" || selectedApplicant?.status === "UNDER_REVIEW";

  function handleReviewAction(type: ReviewDialogType) {
    if (!selectedApplicant) return;
    const applicant = selectedApplicant;
    setSelectedApplicant(null);
    onAction(type, applicant);
  }

  const applicantColumns: ColumnDef<ApplicantListItem>[] = useMemo(
    () => [
      {
        accessorKey: "user",
        header: "Đồng tu",
        cell: ({ row }) => row.original.user?.name ?? "—",
      },
      {
        accessorKey: "template",
        header: "Mẫu đơn",
        cell: ({ row }) => row.original.template?.titleVi ?? "—",
      },
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
          <WorkspaceRowActions
            actions={[
              {
                label: "Xem chi tiết",
                onClick: () => setSelectedApplicant(row.original),
              },
            ]}
          />
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
    <>
      <WorkspaceDataTable
        table={table}
        columns={applicantColumns}
        isLoading={isLoading}
        emptyMessage="Chưa có đơn đăng ký nào."
        onRowClick={setSelectedApplicant}
      />

      <WorkspaceDetailSheet
        open={selectedApplicant !== null}
        onOpenChange={(v) => {
          if (!v) setSelectedApplicant(null);
        }}
        title={selectedApplicant?.user?.name ?? "Chưa xác định"}
        subtitle={selectedApplicant?.template?.titleVi ?? undefined}
        status={
          selectedApplicant && (
            <Badge variant={APPLICANT_STATUS_VARIANT[selectedApplicant.status]}>
              {APPLICANT_STATUS_LABELS[selectedApplicant.status]}
            </Badge>
          )
        }
        primaryActions={
          canReview ? (
            <>
              <Button size="sm" variant="outline" onClick={() => handleReviewAction("PROBATION")}>
                Thử thách
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReviewAction("REJECT")}
              >
                Từ chối
              </Button>
              <Button size="sm" onClick={() => handleReviewAction("APPROVE")}>
                Duyệt
              </Button>
            </>
          ) : undefined
        }
      >
        {selectedApplicant && (
          <WorkspaceDetailSection title="Thông tin đơn">
            <WorkspaceDetailField
              label="Đồng tu"
              value={selectedApplicant.user?.name ?? "—"}
            />
            <WorkspaceDetailField
              label="Mẫu đơn"
              value={selectedApplicant.template?.titleVi ?? "—"}
            />
            <WorkspaceDetailField
              label="Loại đơn"
              value={
                selectedApplicant.template?.formType
                  ? (FORM_TYPE_LABELS[selectedApplicant.template.formType as SacredFormType] ??
                    selectedApplicant.template.formType)
                  : "—"
              }
            />
            <WorkspaceDetailField
              label="Ngày nộp"
              value={new Date(selectedApplicant.createdAt).toLocaleDateString("vi-VN")}
            />
            {selectedApplicant.probationEndsAt && (
              <WorkspaceDetailField
                label="Hết thử thách"
                value={new Date(selectedApplicant.probationEndsAt).toLocaleDateString("vi-VN")}
              />
            )}
            {selectedApplicant.approvedAt && (
              <WorkspaceDetailField
                label="Ngày duyệt"
                value={new Date(selectedApplicant.approvedAt).toLocaleDateString("vi-VN")}
              />
            )}
            {selectedApplicant.rejectedAt && (
              <WorkspaceDetailField
                label="Ngày từ chối"
                value={new Date(selectedApplicant.rejectedAt).toLocaleDateString("vi-VN")}
              />
            )}
          </WorkspaceDetailSection>
        )}
      <WorkspaceDetailStandardSections />
      </WorkspaceDetailSheet>
    </>
  );
}
