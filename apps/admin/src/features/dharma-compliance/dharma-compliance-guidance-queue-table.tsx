import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { Badge } from "@/components/ui/badge";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { guidanceQueueOptions } from "./queries.js";
import { GUIDANCE_URGENCY_VARIANT, type GuidanceQueueItem } from "./types.js";

function GuidanceQueueRowActions({
  item,
  onRespond,
}: {
  item: GuidanceQueueItem;
  onRespond: (item: GuidanceQueueItem) => void;
}) {
  if (item.status !== "PENDING") return null;
  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Phản hồi",
          onClick: () => onRespond(item),
        },
      ]}
    />
  );
}

export function DharmaComplianceGuidanceQueueTable({
  isLoading,
  onRespond,
}: {
  isLoading: boolean;
  onRespond: (item: GuidanceQueueItem) => void;
}) {
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
        cell: ({ row }) => <GuidanceQueueRowActions item={row.original} onRespond={onRespond} />,
      },
    ],
    [onRespond],
  );

  const table = useSafeReactTable({ data: items, columns: guidanceColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <WorkspaceDataTable table={table} columns={guidanceColumns} isLoading={isLoading} emptyMessage="Không có yêu cầu nào." />
  );
}
