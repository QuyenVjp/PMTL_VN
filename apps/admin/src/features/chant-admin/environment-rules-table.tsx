import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChantEnvironmentRulesQueryOptions } from "@/features/chant-admin/queries";
import type {
  ChantEnvironmentRuleRow,
  ChantEnvironmentRulesResponse,
} from "@/features/chant-admin/types";

const severityLabels: Record<string, string> = {
  advisory: "Khuyến cáo",
  caution: "Lưu ý",
  strong_guardrail: "Quan trọng",
  quality_guidance: "Hướng dẫn",
  reference_only: "Tham khảo",
};

const productizationLabels: Record<string, string> = {
  do_not_automate: "Không tự động hóa",
  warning_card: "Warning card",
  checklist_item: "Checklist",
  reference_only: "Reference only",
};

const columns: Array<ColumnDef<ChantEnvironmentRuleRow>> = [
  {
    accessorKey: "groupTitle",
    header: "Nhóm",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.groupTitle}</p>
        <p className="text-xs text-muted-foreground">{row.original.groupKey}</p>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Quy tắc",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium text-foreground">{row.original.title}</p>
        <p className="max-w-[48rem] text-sm leading-6 text-muted-foreground">
          {row.original.canonicalWording}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "severity",
    header: "Mức độ",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {severityLabels[row.original.severity] ?? row.original.severity}
      </Badge>
    ),
  },
  {
    accessorKey: "productizationMode",
    header: "Productization",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {productizationLabels[row.original.productizationMode] ??
            row.original.productizationMode}
        </p>
        {row.original.referenceOnly ? (
          <p className="text-xs text-muted-foreground">reference-only</p>
        ) : null}
      </div>
    ),
  },
];

function flattenEnvironmentRules(
  response: ChantEnvironmentRulesResponse,
): ChantEnvironmentRuleRow[] {
  return response.groups.flatMap((group) =>
    group.rules.map((rule) => ({
      groupKey: group.groupKey,
      groupTitle: group.title,
      ruleKey: rule.ruleKey,
      title: rule.title,
      canonicalWording: rule.canonicalWording,
      severity: rule.severity,
      productizationMode: rule.productizationMode,
      referenceOnly: rule.referenceOnly,
    })),
  );
}

export function EnvironmentRulesTable() {
  const { data, isLoading, error } = useQuery(getChantEnvironmentRulesQueryOptions());
  const [globalFilter, setGlobalFilter] = React.useState("");

  const rows = React.useMemo(
    () => (data ? flattenEnvironmentRules(data) : []),
    [data],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const haystack = [
        row.original.groupTitle,
        row.original.title,
        row.original.canonicalWording,
        row.original.ruleKey,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(String(filterValue).toLowerCase());
    },
    initialState: {
      pagination: { pageSize: 8 },
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">
          Không tải được dữ liệu
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Nhóm quy tắc</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {data.groupCards.length}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Tổng số quy tắc</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{rows.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {new Date(data.intro.updatedAt).toLocaleDateString("vi-VN")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Workspace hiện đang read-only theo safe window.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Môi trường & thời gian
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              DataTable này dùng đúng pattern admin clarity-first: search cục bộ,
              trạng thái rõ, không KPI giả, không demo chart.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <Input
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Tìm theo nhóm, rule key hoặc wording..."
            />
          </div>
        </div>

        <div className="px-5 py-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-10 text-center">
                    <p className="text-sm font-medium text-foreground">
                      Không có rule nào khớp bộ lọc
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Thử đổi từ khóa hoặc xóa bộ lọc hiện tại.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
