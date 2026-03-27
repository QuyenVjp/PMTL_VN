import React, { useEffect, useMemo, useState } from "react";
import {
  type Column,
  type ColumnDef,
  type FilterFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { EyeIcon, MoreHorizontalIcon, PencilLineIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { DataTableBulkActions, DataTableColumnHeader, DataTablePagination, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, toStr } from "@/lib/utils";

export type WorkspaceStat = {
  label: string;
  value: string;
  note: string;
};

export type WorkspaceColumn = {
  key: string;
  label: string;
  className?: string;
  render?: (row: WorkspaceRow) => React.ReactNode;
  getFilterValue?: (row: WorkspaceRow) => string | string[] | undefined;
  enableHiding?: boolean;
  enableSorting?: boolean;
};

export type WorkspaceRow = {
  id: string;
  actions?: string[];
  [key: string]: unknown;
};

export type WorkspaceHeaderAction = {
  label: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  icon?: React.ComponentType<{ className?: string }>;
  mode?: "create" | "feedback";
  createDefaults?: Partial<WorkspaceRow>;
  feedbackMessage?: string;
};

export type WorkspaceFilter = {
  label: string;
  value: string;
  predicate: (row: WorkspaceRow) => boolean;
};

type WorkspaceTablePageProps = {
  title: string;
  description: string;
  searchPlaceholder: string;
  stats?: WorkspaceStat[];
  filters?: WorkspaceFilter[];
  columns: WorkspaceColumn[];
  rows: WorkspaceRow[];
  primaryAction?: string;
  headerActions?: WorkspaceHeaderAction[];
  emptyMessage?: string;
  entityName?: string;
};

type ColumnMeta = {
  label?: string;
  thClassName?: string;
  tdClassName?: string;
};

type DialogMode = "create" | "view" | "edit" | "danger" | null;

const globalFilterFn: FilterFn<WorkspaceRow> = (row, _columnId, value) => {
  const query = `${value ?? ""}`.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = Object.values(row.original)
    .flatMap((item): string[] => (Array.isArray(item) ? item.map(toStr) : [toStr(item)]))
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

function badgeVariant(value: string) {
  const normalized = value.toLowerCase();

  if (
    normalized.includes("khỏe") ||
    normalized.includes("đang bật") ||
    normalized.includes("đang xuất bản") ||
    normalized.includes("hoạt động") ||
    normalized.includes("ổn định") ||
    normalized.includes("thành công") ||
    normalized.includes("đã duyệt") ||
    normalized.includes("đã xem")
  ) {
    return "secondary" as const;
  }

  if (
    normalized.includes("cảnh báo") ||
    normalized.includes("chờ duyệt") ||
    normalized.includes("nháp") ||
    normalized.includes("đang xử lý") ||
    normalized.includes("chờ gửi") ||
    normalized.includes("cần cập nhật") ||
    normalized.includes("mở mới") ||
    normalized.includes("khẩn") ||
    normalized.includes("tạm nghỉ")
  ) {
    return "outline" as const;
  }

  if (normalized.includes("tắt") || normalized.includes("ẩn") || normalized.includes("khóa") || normalized.includes("sự cố")) {
    return "default" as const;
  }

  return "outline" as const;
}

function renderCellValue(key: string, value: string | string[] | undefined) {
  if (!value) {
    return "—";
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item) => (
          <Badge key={`${key}-${item}`} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
    );
  }

  if (key.toLowerCase().includes("trangthai") || key.toLowerCase().includes("uutien") || key.toLowerCase().includes("mucdo") || key.toLowerCase().includes("suckhoe")) {
    return <Badge variant={badgeVariant(value)}>{value}</Badge>;
  }

  return value;
}

function normalizeCellValue(value: unknown): string | string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

function shouldFacetColumn(key: string) {
  const normalized = key.toLowerCase();
  return ["trangthai", "uutien", "loai", "owner", "doituong", "vaitro"].some((token) => normalized.includes(token));
}

function getNowLabel() {
  const now = new Date();
  const date = now.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  const time = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} ${time}`;
}

function createDraftRow(title: string, columns: WorkspaceColumn[], rows: WorkspaceRow[]) {
  const nextId = `${title.toLowerCase().replace(/\s+/g, "-")}-${rows.length + 1}`;
  const draftRow: WorkspaceRow = {
    id: nextId,
    actions: ["Mở", "Giao owner", "Xóa"],
  };

  for (const column of columns) {
    const key = column.key.toLowerCase();

    if (key.includes("trangthai")) {
      draftRow[column.key] = "Nháp";
      continue;
    }

    if (key.includes("capnhat") || key.includes("lancuoi")) {
      draftRow[column.key] = getNowLabel();
      continue;
    }

    if (key.includes("email")) {
      draftRow[column.key] = `${nextId}@pmtl.local`;
      continue;
    }

    if (
      key.includes("owner") ||
      key.includes("phutrach") ||
      key.includes("tacgia") ||
      key.includes("nguoigui")
    ) {
      draftRow[column.key] = "Vận hành PMTL";
      continue;
    }

    if (key.includes("mabaocao")) {
      draftRow[column.key] = `RPT-${Math.floor(10000 + Math.random() * 89999)}`;
      continue;
    }

    if (key.includes("job")) {
      draftRow[column.key] = `JOB-${Math.floor(1000 + Math.random() * 8999)}`;
      continue;
    }

    draftRow[column.key] = `${column.label} mới`;
  }

  return draftRow;
}

function resolveActionUpdate(action: string, row: WorkspaceRow) {
  const statusKey = Object.keys(row).find((key) => key.toLowerCase().includes("trangthai"));
  const updatedAtKey = Object.keys(row).find(
    (key) => key.toLowerCase().includes("capnhat") || key.toLowerCase().includes("lancuoi"),
  );
  const next = { ...row };

  if (statusKey) {
    if (action === "Duyệt") next[statusKey] = "Đang xuất bản";
    if (action === "Trả lại") next[statusKey] = "Cần chỉnh sửa";
    if (action === "Nhận xử lý" || action === "Ra quyết định" || action === "Giao owner") next[statusKey] = "Đang xử lý";
    if (action === "Khôi phục" || action === "Mở khóa") next[statusKey] = "Hoạt động";
    if (action === "Ẩn") next[statusKey] = "Đã ẩn";
    if (action === "Khóa") next[statusKey] = "Đang khóa";
    if (action === "Thu hồi") next[statusKey] = "Đã thu hồi";
    if (action === "Xuất bản lại") next[statusKey] = "Đang xuất bản";
    if (action === "Tiếp tục sửa") next[statusKey] = "Đang chỉnh sửa";
    if (action === "Thay thế" || action === "Gửi lại" || action === "Redrive") next[statusKey] = "Đang xử lý";
    if (action === "Đổi vai trò") next[statusKey] = row[statusKey] ?? "Hoạt động";
  }

  if (updatedAtKey) {
    next[updatedAtKey] = getNowLabel();
  }

  return next;
}

function normalizeRowForForm(row: WorkspaceRow, columns: WorkspaceColumn[]) {
  return columns.reduce<Record<string, string>>((accumulator, column) => {
    const value = row[column.key];
    accumulator[column.key] = Array.isArray(value) ? value.map(toStr).join(", ") : toStr(value);
    return accumulator;
  }, {});
}

function resolveActionMode(action: string): Exclude<DialogMode, null> {
  if (action.startsWith("Mở") || action.startsWith("Xem")) {
    return "view";
  }

  if (action.includes("Xóa") || action.includes("Ẩn") || action.includes("Khóa") || action.includes("Thu hồi")) {
    return "danger";
  }

  return "edit";
}

export function WorkspaceTablePage({
  title,
  description,
  searchPlaceholder,
  stats,
  filters,
  columns,
  rows,
  primaryAction,
  headerActions,
  emptyMessage = "Không có dữ liệu phù hợp với bộ lọc hiện tại.",
  entityName,
}: WorkspaceTablePageProps) {
  const activeFilters = filters?.length ? filters : [{ label: "Tất cả", value: "all", predicate: () => true }];

  const [activeFilter, setActiveFilter] = useState(activeFilters[0]?.value ?? "all");
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [tableRows, setTableRows] = useState(rows);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState<WorkspaceRow | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const actions = headerActions?.length
    ? headerActions
    : primaryAction
      ? [{ label: primaryAction, mode: "create" as const }]
      : [];

  useEffect(() => {
    setTableRows(rows);
  }, [rows]);

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [activeFilter, globalFilter, tableRows]);

  const scopedRows = useMemo(() => {
    const active = activeFilters.find((item) => item.value === activeFilter) ?? activeFilters[0];
    return tableRows.filter((row) => active.predicate(row));
  }, [activeFilter, activeFilters, tableRows]);

  const facetedFilters = useMemo(() => {
    return columns
      .filter((column) => shouldFacetColumn(column.key))
      .map((column) => {
        const values = Array.from(
          new Set(
            scopedRows
              .flatMap((row) => {
                const value = column.getFilterValue?.(row) ?? normalizeCellValue(row[column.key]);
                return Array.isArray(value) ? value : value ? [value] : [];
              })
              .filter(Boolean),
          ),
        ).slice(0, 8);

        return {
          columnId: column.key,
          title: column.label,
          options: values.map((value) => ({ label: value, value })),
        };
      })
      .filter((filter) => filter.options.length > 1);
  }, [columns, scopedRows]);

  const tableColumns = useMemo<ColumnDef<WorkspaceRow>[]>(() => {
    const mappedColumns: ColumnDef<WorkspaceRow>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Chọn tất cả"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Chọn dòng"
            className="translate-y-[2px]"
          />
        ),
        meta: { label: "Chọn" },
        enableSorting: false,
        enableHiding: false,
        size: 36,
      },
      ...columns.map((column) => ({
        accessorKey: column.key,
        header: (context: { column: Column<WorkspaceRow, unknown> }) => (
          <DataTableColumnHeader column={context.column} title={column.label} />
        ),
        cell: ({ row }: { row: { original: WorkspaceRow } }) =>
          column.render
            ? column.render(row.original)
            : renderCellValue(column.key, normalizeCellValue(row.original[column.key])),
        meta: {
          label: column.label,
          thClassName: column.className,
          tdClassName: column.className,
        } satisfies ColumnMeta,
        enableHiding: column.enableHiding ?? true,
        enableSorting: column.enableSorting ?? true,
      })),
    ];

    if (tableRows.some((row) => row.actions?.length)) {
      mappedColumns.push({
        id: "actions",
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Mở menu thao tác</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {(row.original.actions ?? []).map((action: string, index: number, actions: string[]) => {
                  const isDestructive =
                    action.includes("Xóa") || action.includes("Ẩn") || action.includes("Khóa") || action.includes("Thu hồi");
                  const previousAction = actions[index - 1];
                  const previousDestructive =
                    previousAction &&
                    (previousAction.includes("Xóa") ||
                      previousAction.includes("Ẩn") ||
                      previousAction.includes("Khóa") ||
                      previousAction.includes("Thu hồi"));

                  return (
                    <React.Fragment key={`${row.original.id}-${action}`}>
                      {isDestructive && !previousDestructive ? <div className="my-1 h-px bg-border" /> : null}
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveRow(row.original);
                          setActiveAction(action);
                          setFormValues(normalizeRowForForm(row.original, columns));
                          setDialogMode(resolveActionMode(action));
                        }}
                        className={isDestructive ? "text-destructive focus:text-destructive" : undefined}
                      >
                        {action}
                        <DropdownMenuShortcut>
                          {action.startsWith("Mở") || action.startsWith("Xem") ? (
                            <EyeIcon className="size-4" />
                          ) : isDestructive ? (
                            <Trash2Icon className="size-4" />
                          ) : (
                            <PencilLineIcon className="size-4" />
                          )}
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </React.Fragment>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        meta: { label: "Thao tác", thClassName: "w-[76px] text-right", tdClassName: "w-[76px]" } satisfies ColumnMeta,
        enableSorting: false,
        enableHiding: false,
      });
    }

    return mappedColumns;
  }, [columns, tableRows]);

  const table = useReactTable({
    data: scopedRows,
    columns: tableColumns,
    state: {
      rowSelection,
      sorting,
      columnVisibility,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const visibleCount = table.getFilteredRowModel().rows.length;

  const closeDialog = () => {
    setDialogMode(null);
    setActiveAction(null);
    setActiveRow(null);
    setFormValues({});
  };

  const handlePrimaryAction = (actionLabel: string, createDefaults?: Partial<WorkspaceRow>) => {
    const draft = createDraftRow(title, columns, tableRows);
    const nextDraft = { ...draft, ...createDefaults };
    setActiveRow(nextDraft);
    setActiveAction(actionLabel);
    setFormValues(normalizeRowForForm(nextDraft, columns));
    setDialogMode("create");
  };

  const handleHeaderAction = (action: WorkspaceHeaderAction) => {
    if ((action.mode ?? "create") === "create") {
      handlePrimaryAction(action.label, action.createDefaults);
      return;
    }

    setFeedbackMessage(
      action.feedbackMessage ?? `Đã thực thi thao tác "${action.label}" trong ${title.toLowerCase()}.`,
    );
  };

  const handleBulkReview = () => {
    const selectedIds = new Set(table.getFilteredSelectedRowModel().rows.map((row) => row.original.id));
    setTableRows((current) =>
      current.map((row) => (selectedIds.has(row.id) ? resolveActionUpdate("Nhận xử lý", row) : row)),
    );
    table.resetRowSelection();
    setFeedbackMessage(`Đã gắn theo dõi ${selectedIds.size} mục trong ${title.toLowerCase()}.`);
  };

  const commitDialog = () => {
    if (!activeRow || !dialogMode) {
      return;
    }

    if (dialogMode === "create") {
      const created: WorkspaceRow = {
        ...activeRow,
        ...Object.fromEntries(columns.map((column) => [column.key, formValues[column.key] ?? activeRow[column.key] ?? ""])),
        actions: activeRow.actions ?? ["Mở", "Giao owner", "Xóa"],
      };
      setTableRows((current) => [created, ...current]);
      setFeedbackMessage(`Đã tạo mới một mục trong ${title.toLowerCase()}.`);
      closeDialog();
      return;
    }

    if (dialogMode === "danger") {
      if ((activeAction ?? "").includes("Xóa")) {
        setTableRows((current) => current.filter((row) => row.id !== activeRow.id));
        setFeedbackMessage(`Đã xóa mục khỏi ${title.toLowerCase()}.`);
      } else {
        setTableRows((current) =>
          current.map((row) => (row.id === activeRow.id ? resolveActionUpdate(activeAction ?? "", row) : row)),
        );
        setFeedbackMessage(`${activeAction} · ${title}`);
      }
      closeDialog();
      return;
    }

    if (dialogMode === "edit") {
      setTableRows((current) =>
        current.map((row) =>
          row.id === activeRow.id
            ? {
                ...resolveActionUpdate(activeAction ?? "", row),
                ...Object.fromEntries(columns.map((column) => [column.key, formValues[column.key] ?? row[column.key] ?? ""])),
              }
            : row,
        ),
      );
      setFeedbackMessage(`${activeAction} · ${title}`);
      closeDialog();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actions.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action, index) => {
              const Icon = action.icon ?? PlusIcon;
              return (
                <Button
                  key={action.label}
                  variant={action.variant ?? (index === actions.length - 1 ? "default" : "outline")}
                  onClick={() => handleHeaderAction(action)}
                >
                  <Icon className="size-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        ) : null}
      </div>

      {stats?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-3">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{stat.note}</CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} filters={facetedFilters} />

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  size="sm"
                  variant={filter.value === activeFilter ? "secondary" : "outline"}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{visibleCount} mục hiển thị</div>
          </div>

          {feedbackMessage ? (
            <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">{feedbackMessage}</div>
          ) : null}

          <ScrollArea orientation="horizontal" className="w-full rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="group/row">
                    {headerGroup.headers.map((header) => {
                      const meta = (header.column.columnDef.meta as ColumnMeta | undefined) ?? undefined;
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className={cn(
                            "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                            meta?.thClassName,
                          )}
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="group/row">
                      {row.getVisibleCells().map((cell) => {
                        const meta = (cell.column.columnDef.meta as ColumnMeta | undefined) ?? undefined;
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                              meta?.tdClassName,
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length} className="h-24 text-center text-sm text-muted-foreground">
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <DataTablePagination table={table} className="pt-2" />
          <DataTableBulkActions table={table} entityName={entityName ?? "mục"}>
            <Button size="sm" variant="outline" onClick={handleBulkReview}>
              Gắn theo dõi
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id).join(", ");
                setFeedbackMessage(`Đã chuẩn bị xuất danh sách: ${selectedRows || "chưa có lựa chọn"}.`);
              }}
            >
              Xuất danh sách
            </Button>
          </DataTableBulkActions>
        </CardContent>
      </Card>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create"
                ? primaryAction
                : dialogMode === "view"
                  ? activeAction
                  : dialogMode === "danger"
                    ? `${activeAction} mục`
                    : activeAction}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "view"
                ? `Xem nhanh dữ liệu của ${title.toLowerCase()} mà không rời table.`
                : dialogMode === "danger"
                  ? `Xác nhận thao tác ${activeAction?.toLowerCase()} trên mục đang chọn.`
                  : `Cập nhật dữ liệu của ${title.toLowerCase()} bằng common form dùng chung.`}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "view" && activeRow ? (
            <div className="grid gap-3 md:grid-cols-2">
              {columns.map((column) => (
                <div key={column.key} className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">{column.label}</p>
                  <div className="mt-2 font-medium">{renderCellValue(column.key, normalizeCellValue(activeRow[column.key]))}</div>
                </div>
              ))}
            </div>
          ) : null}

          {(dialogMode === "create" || dialogMode === "edit") && activeRow ? (
            <div className="grid gap-4 md:grid-cols-2">
              {columns.map((column) => (
                <div key={column.key} className="grid gap-2">
                  <label htmlFor={`${activeRow.id}-${column.key}`} className="text-sm font-medium">
                    {column.label}
                  </label>
                  <Input
                    id={`${activeRow.id}-${column.key}`}
                    value={formValues[column.key] ?? ""}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        [column.key]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          ) : null}

          {dialogMode === "danger" && activeRow ? (
            <div className="rounded-xl border p-4">
              <p className="font-medium">{activeAction}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Mục đang chọn: {columns.map((column) => formValues[column.key]).find(Boolean) ?? activeRow.id}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Đóng
            </Button>
            {dialogMode !== "view" ? (
              <Button onClick={commitDialog}>
                {dialogMode === "create" ? "Tạo mới" : dialogMode === "danger" ? "Xác nhận" : "Lưu thay đổi"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
