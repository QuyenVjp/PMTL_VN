import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { eventListOptions, type EventListItem } from "./queries.js";
import { useCheckIn } from "./mutations.js";
import { EVENT_STATUS_LABELS, EVENT_STATUS_VARIANT, EVENT_TYPE_LABELS, type EventStatus, type EventType } from "./types.js";

function EventRowActions({ row }: { row: EventListItem }) {
  const checkIn = useCheckIn();

  const actions = [
    {
      label: "Xem / Sửa",
      onClick: () => {
        toast.info("Tính năng đang phát triển.");
      },
    },
    ...(row.status === "IN_PROGRESS" || row.status === "REGISTRATION_CLOSED"
      ? [
          {
            label: "Điểm danh",
            separator: true,
            onClick: () => {
              const memberId = window.prompt("Nhập mã thành viên để điểm danh:");
              if (!memberId?.trim()) return;
              checkIn.mutate({ eventPublicId: row.id, userId: memberId.trim() });
            },
          },
        ]
      : []),
  ];

  return <WorkspaceRowActions actions={actions} />;
}

export function EventsTable() {
  const { data: envelope, isLoading } = useQuery(eventListOptions());
  const events = useMemo(() => envelope?.data ?? [], [envelope]);

  const columns: ColumnDef<EventListItem>[] = useMemo(
    () => [
      { accessorKey: "titleVi", header: "Tên sự kiện" },
      {
        accessorKey: "eventType",
        header: "Loại",
        cell: ({ row }) => EVENT_TYPE_LABELS[row.original.eventType as EventType],
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={EVENT_STATUS_VARIANT[row.original.status as EventStatus]}>
            {EVENT_STATUS_LABELS[row.original.status as EventStatus]}
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <EventRowActions row={row.original} />,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <WorkspaceDataTable table={table} columns={columns} isLoading={isLoading} emptyMessage="Chưa có sự kiện nào." />
  );
}
