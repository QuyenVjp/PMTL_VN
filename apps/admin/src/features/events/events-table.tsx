import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { eventListOptions, type EventListItem } from "./queries.js";
import { EVENT_STATUS_LABELS, EVENT_STATUS_VARIANT, EVENT_TYPE_LABELS } from "./types.js";
import { EventsCheckInDialog } from "./events-check-in-dialog";

function EventRowActions({ row }: { row: EventListItem }) {
  const navigate = useNavigate();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const canCheckIn = row.status === "IN_PROGRESS" || row.status === "REGISTRATION_CLOSED";

  const actions = [
    {
      label: "Xem chi tiết",
      onClick: () => void navigate({ to: "/su-kien/danh-sach/$publicId", params: { publicId: row.id } }),
    },
    ...(canCheckIn
      ? [{ label: "Điểm danh", onClick: () => setCheckInOpen(true) }]
      : []),
  ];

  return (
    <>
      <WorkspaceRowActions actions={actions} />
      {canCheckIn && (
        <EventsCheckInDialog
          eventPublicId={row.id}
          eventTitle={row.titleVi}
          open={checkInOpen}
          onOpenChange={setCheckInOpen}
        />
      )}
    </>
  );
}

export function EventsTable() {
  const navigate = useNavigate();
  const { data: envelope, isLoading } = useQuery(eventListOptions());
  const events = useMemo(() => envelope?.data ?? [], [envelope]);

  const columns: ColumnDef<EventListItem>[] = useMemo(
    () => [
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
    <WorkspaceDataTable
      table={table}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Chưa có sự kiện nào."
      onRowClick={(row) => {
        void navigate({ to: "/su-kien/danh-sach/$publicId", params: { publicId: row.id } });
      }}
    />
  );
}
