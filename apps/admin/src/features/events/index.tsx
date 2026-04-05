import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { eventListOptions } from "./queries.js";
import { EVENT_STATUS_LABELS, EVENT_STATUS_VARIANT, EVENT_TYPE_LABELS, type EventListItem } from "./types.js";

const columns: ColumnDef<EventListItem>[] = [
  { accessorKey: "titleVi", header: "Tên sự kiện" },
  {
    accessorKey: "eventType",
    header: "Loại",
    cell: ({ row }) => EVENT_TYPE_LABELS[row.original.eventType],
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={EVENT_STATUS_VARIANT[row.original.status]}>
        {EVENT_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  { accessorKey: "deliveryMode", header: "Hình thức" },
  {
    accessorKey: "startAt",
    header: "Ngày bắt đầu",
    cell: ({ row }) => new Date(row.original.startAt).toLocaleDateString("vi-VN"),
  },
  {
    accessorKey: "isFree",
    header: "Miễn phí",
    cell: ({ row }) => (
      <Badge variant={row.original.isFree ? "secondary" : "destructive"}>
        {row.original.isFree ? "Miễn phí" : "Có phí"}
      </Badge>
    ),
  },
  {
    accessorKey: "organizer",
    header: "Tổ chức",
    cell: ({ row }) => row.original.organizer?.name ?? "—",
  },
];

export function EventsListPage() {
  const { data: envelope, isLoading } = useQuery(eventListOptions());
  const events = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sự kiện Phật pháp</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý các sự kiện tu học và cộng đồng</p>
      </div>
      <WorkspaceDataTable table={table} columns={columns} isLoading={isLoading} emptyMessage="Chưa có sự kiện nào." />
    </div>
  );
}
