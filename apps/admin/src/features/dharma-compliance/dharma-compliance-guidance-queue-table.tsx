import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { Badge } from "@/components/ui/badge";
import {
  WorkspaceDataTable,
  WorkspaceRowActions,
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceDetailField,
} from "@/components/workspace";
import { guidanceQueueOptions } from "./queries.js";
import { GUIDANCE_URGENCY_VARIANT, type GuidanceQueueItem } from "./types.js";

export function DharmaComplianceGuidanceQueueTable({ isLoading }: { isLoading: boolean }) {
  const [selectedItem, setSelectedItem] = useState<GuidanceQueueItem | null>(null);
  const { data: envelope } = useQuery(guidanceQueueOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const guidanceColumns: ColumnDef<GuidanceQueueItem>[] = useMemo(
    () => [
      {
        accessorKey: "practitioner",
        header: "Đồng tu",
        cell: ({ row }) => row.original.practitioner ?? "—",
      },
      { accessorKey: "category", header: "Danh mục" },
      {
        accessorKey: "question",
        header: "Câu hỏi",
        cell: ({ row }) => <span className="line-clamp-2">{row.original.question}</span>,
      },
      {
        accessorKey: "urgency",
        header: "Mức độ khẩn",
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
      {
        accessorKey: "createdAt",
        header: "Ngày gửi",
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
                onClick: () => setSelectedItem(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: items,
    columns: guidanceColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <WorkspaceDataTable
        table={table}
        columns={guidanceColumns}
        isLoading={isLoading}
        emptyMessage="Không có yêu cầu nào."
      />

      <WorkspaceDetailSheet
        open={selectedItem !== null}
        onOpenChange={(v) => {
          if (!v) setSelectedItem(null);
        }}
        title={selectedItem?.practitioner ?? "Đồng tu ẩn danh"}
        subtitle={selectedItem?.category ?? undefined}
        status={
          selectedItem && (
            <Badge variant={selectedItem.status === "ANSWERED" ? "secondary" : "outline"}>
              {selectedItem.status}
            </Badge>
          )
        }
      >
        {selectedItem && (
          <WorkspaceDetailSection title="Nội dung câu hỏi">
            <WorkspaceDetailField
              label="Đồng tu"
              value={selectedItem.practitioner ?? "—"}
            />
            <WorkspaceDetailField label="Danh mục" value={selectedItem.category} />
            <WorkspaceDetailField
              label="Mức độ khẩn"
              value={
                <Badge variant={GUIDANCE_URGENCY_VARIANT[selectedItem.urgency]}>
                  {selectedItem.urgency}
                </Badge>
              }
            />
            <WorkspaceDetailField
              label="Câu hỏi"
              value={selectedItem.question}
              stacked
            />
            <WorkspaceDetailField
              label="Ngày gửi"
              value={new Date(selectedItem.createdAt).toLocaleDateString("vi-VN")}
            />
            {selectedItem.response && (
              <WorkspaceDetailField
                label="Phản hồi"
                value={selectedItem.response}
                stacked
              />
            )}
          </WorkspaceDetailSection>
        )}
      </WorkspaceDetailSheet>
    </>
  );
}
