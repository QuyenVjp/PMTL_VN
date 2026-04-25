/**
 * Self-Cultivation printable template tab.
 * Shows only backend-owned downloads from the Kinh văn tự tu overview.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { DownloadIcon, FileTextIcon } from "lucide-react";

import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceDataTable } from "@/components/workspace";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";

import {
  selfCultivationOverviewOptions,
  type SelfCultivationDownload,
} from "./queries";

const assetTypeOptions = [
  { label: "Biểu mẫu in", value: "PRINTABLE" },
  { label: "PDF hướng dẫn", value: "GUIDE_PDF" },
  { label: "Bảng phân biệt", value: "BANG_PHAN_BIET" },
];

function assetTypeLabel(type: SelfCultivationDownload["assetType"]) {
  if (type === "PRINTABLE") return "Biểu mẫu in";
  if (type === "GUIDE_PDF") return "PDF hướng dẫn";
  return "Bảng phân biệt";
}

export function TemplatesTab() {
  const { data: overview, isLoading } = useQuery(selfCultivationOverviewOptions());
  const rows = useMemo(() => overview?.downloads ?? [], [overview]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<SelfCultivationDownload>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Biểu mẫu" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded border bg-muted">
              <FileTextIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.title}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.fileName}</p>
            </div>
          </div>
        ),
        meta: { label: "Biểu mẫu" },
      },
      {
        accessorKey: "assetType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại tài liệu" />,
        cell: ({ row }) => (
          <Badge variant="outline">{assetTypeLabel(row.original.assetType)}</Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Loại tài liệu" },
      },
      {
        accessorKey: "displayOrder",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
        cell: ({ row }) => row.original.displayOrder,
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <Button size="sm" variant="outline" disabled>
            <DownloadIcon className="mr-1.5 size-3.5" />
            Tải từ media
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">Biểu mẫu tự tu</h3>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          Danh sách file in/PDF lấy từ overview API của Kinh văn tự tu. Tab này không còn dùng dữ liệu mẫu
          và không hiển thị thao tác tạo giả khi backend chưa có endpoint quản lý template riêng.
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-800 dark:bg-blue-950/30">
        <p className="font-medium text-blue-800 dark:text-blue-300">Lưu ý vận hành</p>
        <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
          Biểu mẫu tự tu phải đi qua luồng media/download chính thức để giữ provenance và audit.
          Không yêu cầu operator upload PDF vào màn hình mock riêng.
        </p>
      </div>

      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc biểu mẫu..."
        searchKey="title"
        viewButtonLabel="Xem"
        filters={[{ columnId: "assetType", title: "Loại", options: assetTypeOptions }]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có biểu mẫu tự tu nào trong overview API."
      />
    </div>
  );
}
