import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { WorkspaceDataTable } from "@/components/workspace";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";

import { disposalPolaritiesOptions, type DisposalPolarity, type DisposalPolarityItem } from "./queries.js";

const POLARITY_BADGE: Record<
  DisposalPolarity,
  { label: string; variant: "destructive" | "secondary" | "outline" }
> = {
  BURN: { label: "Đốt an toàn", variant: "destructive" },
  KEEP: { label: "Lưu trữ / Niêm phong", variant: "secondary" },
  OTHER: { label: "Theo hướng dẫn", variant: "outline" },
};

export function DisposalPolarityPage() {
  const { data, isLoading, isError } = useQuery(disposalPolaritiesOptions());
  const rules = useMemo(() => data?.data ?? [], [data]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<DisposalPolarityItem>[]>(
    () => [
      {
        accessorKey: "formType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại đơn" />,
        cell: ({ row }) => <span className="font-medium">{row.original.formType}</span>,
        meta: { label: "Loại đơn" },
      },
      {
        accessorKey: "rule",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Quy tắc xử lý" />,
        cell: ({ row }) => row.original.rule ?? "—",
        meta: { label: "Quy tắc xử lý" },
      },
      {
        accessorKey: "polarity",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phân cực" />,
        cell: ({ row }) => {
          const badge = POLARITY_BADGE[row.original.polarity] ?? POLARITY_BADGE.OTHER;
          return <Badge variant={badge.variant}>{badge.label}</Badge>;
        },
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Phân cực" },
      },
      {
        accessorKey: "note",
        header: "Ghi chú",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.note ?? "—"}</span>
        ),
      },
      {
        accessorKey: "effectiveAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hiệu lực" />,
        cell: ({ row }) =>
          row.original.effectiveAt
            ? new Date(row.original.effectiveAt).toLocaleDateString("vi-VN")
            : "—",
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: rules,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quy tắc xử lý đơn</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quy tắc phân cực xử lý đơn Pháp Bảo — đốt / không đốt. Dữ liệu lấy từ máy chủ.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Alert variant="destructive">
          <AlertTitle>Quy tắc 1 — Bắt buộc đốt an toàn</AlertTitle>
          <AlertDescription>
            Đơn <strong>đổi Pháp danh</strong> sau khi được duyệt phải tiến hành{" "}
            <strong>đốt an toàn</strong> theo nghi thức. Không được lưu trữ bản gốc.
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertTitle>Quy tắc 2 — Tuyệt đối cấm đốt</AlertTitle>
          <AlertDescription>
            Đơn <strong>Khuyến Đạo</strong> phải được <strong>lưu trữ và niêm phong</strong> vĩnh viễn.
            Tuyệt đối cấm đốt dưới bất kỳ hình thức nào.
          </AlertDescription>
        </Alert>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Không tải được quy tắc xử lý đơn</AlertTitle>
          <AlertDescription>Vui lòng kiểm tra API quản trị Đơn Pháp Bảo trước khi thao tác.</AlertDescription>
        </Alert>
      ) : null}

      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc loại đơn..."
        searchKey="formType"
        viewButtonLabel="Xem"
        filters={[
          {
            columnId: "polarity",
            title: "Phân cực",
            options: [
              { label: "Đốt an toàn", value: "BURN" },
              { label: "Lưu trữ / Niêm phong", value: "KEEP" },
              { label: "Theo hướng dẫn", value: "OTHER" },
            ],
          },
        ]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="Đang tải quy tắc xử lý đơn..."
        emptyMessage="Chưa có quy tắc xử lý đơn nào được ghi nhận."
      />
    </div>
  );
}
