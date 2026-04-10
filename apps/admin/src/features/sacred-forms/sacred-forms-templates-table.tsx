import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { templateListOptions, type TemplateListItem } from "./queries.js";
import { useToggleTemplate } from "./mutations.js";
import { FORM_TYPE_LABELS } from "./types.js";

function TemplateRowActions({ item }: { item: TemplateListItem }) {
  const toggle = useToggleTemplate();

  const actions = [
    {
      label: item.isActive ? "Tắt hoạt động" : "Kích hoạt",
      onClick: () => {
        toggle.mutate({ publicId: item.id, isActive: !item.isActive });
      },
    },
  ];

  return <WorkspaceRowActions actions={actions} />;
}

export function SacredFormTemplatesTable() {
  const { data: envelope, isLoading } = useQuery(templateListOptions());
  const templates = useMemo(() => envelope?.data ?? [], [envelope]);

  const templateColumns: ColumnDef<TemplateListItem>[] = useMemo(
    () => [
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <TemplateRowActions item={row.original} />,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: templates,
    columns: templateColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <WorkspaceDataTable table={table} columns={templateColumns} isLoading={isLoading} emptyMessage="Chưa có mẫu đơn nào." />
  );
}
