import React, { createContext, useContext, useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { BookOpenIcon, CheckCircleIcon, EyeIcon, Trash2Icon } from "lucide-react";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { useNavigateTo } from "@/lib/router-utils";
import { createSelectColumn } from "@/lib/table/select-column";
import { wisdomEntryListOptions, type WisdomEntryItem } from "./queries";
import {
  usePublishWisdomEntry,
  useDeleteWisdomEntry,
} from "./mutations";

// ── Context ───────────────────────────────────────────────────────────

type WisdomDialogType = "publish" | "delete" | null;

type WisdomContextValue = {
  open: WisdomDialogType;
  currentRow: WisdomEntryItem | null;
  setOpen: (v: WisdomDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<WisdomEntryItem | null>>;
};

const WisdomContext = createContext<WisdomContextValue | null>(null);

function WisdomProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<WisdomDialogType>(null);
  const [currentRow, setCurrentRow] = useState<WisdomEntryItem | null>(null);
  return (
    <WisdomContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </WisdomContext.Provider>
  );
}

function useWisdom() {
  const ctx = useContext(WisdomContext);
  if (!ctx) throw new Error("useWisdom must be used within WisdomProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────

const entryTypeOptions = [
  { label: "Bạch thoại Phật pháp", value: "BACH_THOAI" },
  { label: "Khai thị", value: "KHAI_THI" },
  { label: "Phật ngôn Phật ngữ", value: "PHAT_NGON" },
  { label: "Bài pháp hội", value: "PHAP_HOI" },
];
function entryTypeLabel(t: string): string {
  return entryTypeOptions.find((o) => o.value === t)?.label ?? t;
}

const statusOptions = [
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Lưu trữ", value: "ARCHIVED" },
];

function entryTypeBadgeClass(t: string): string {
  if (t === "BACH_THOAI") return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (t === "KHAI_THI") return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400";
  if (t === "PHAT_NGON") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (t === "PHAP_HOI") return "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400";
  return "";
}

function statusBadgeClass(s: string): string {
  if (s === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400";
}

function statusLabel(s: string): string {
  if (s === "PUBLISHED") return "Đã xuất bản";
  if (s === "DRAFT") return "Nháp";
  if (s === "ARCHIVED") return "Lưu trữ";
  return s;
}

// ── Row actions ───────────────────────────────────────────────────────

function WisdomRowActions({ row }: { row: WisdomEntryItem }) {
  const { setOpen, setCurrentRow } = useWisdom();
  const navigateTo = useNavigateTo();
  const open = (dialog: WisdomDialogType) => { setCurrentRow(row); setOpen(dialog); };
  return (
    <WorkspaceRowActions
      actions={[
        { label: "Xem chi tiết", icon: EyeIcon, onClick: () => navigateTo(`/noi-dung/bach-thoai/${row.publicId}`) },
        ...(row.status !== "PUBLISHED"
          ? [{ label: "Xuất bản", icon: CheckCircleIcon, onClick: () => open("publish") }]
          : []),
        {
          label: "Xoá",
          icon: Trash2Icon,
          onClick: () => open("delete"),
          variant: "destructive" as const,
          separator: true,
        },
      ]}
    />
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function WisdomTable() {
  const navigateTo = useNavigateTo();
  const { data: envelope, isLoading } = useQuery(wisdomEntryListOptions({ limit: 100 }));
  const entries = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<WisdomEntryItem>[]>(
    () => [
      createSelectColumn<WisdomEntryItem>(),
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate text-sm font-medium">{row.original.title}</div>
        ),
        meta: { label: "Tiêu đề" },
        enableHiding: false,
      },
      {
        accessorKey: "entryType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={entryTypeBadgeClass(row.original.entryType)}>
            {entryTypeLabel(row.original.entryType)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Loại" },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={statusBadgeClass(row.original.status)}>
            {statusLabel(row.original.status)}
          </Badge>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id))),
        meta: { label: "Trạng thái" },
        enableSorting: false,
      },
      {
        accessorKey: "author",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tác giả" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm">{row.original.author.displayName}</div>
        ),
        meta: { label: "Tác giả" },
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-muted-foreground text-sm">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </div>
        ),
        meta: { label: "Ngày tạo" },
      },
      {
        id: "actions",
        cell: ({ row }) => <WisdomRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: entries,
    columns,
    state: { sorting, rowSelection, columnVisibility },
    getRowId: (row) => row.publicId,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="max-sm:has-[div[role='toolbar']]:mb-16 flex flex-1 flex-col gap-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc bài Bạch thoại..."
        searchKey="title"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "entryType", title: "Loại bài", options: entryTypeOptions },
          { columnId: "status", title: "Trạng thái", options: statusOptions },
        ]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có bài nào trong thư viện Bạch thoại."
        onRowClick={(row) => navigateTo(`/noi-dung/bach-thoai/${row.publicId}`)}
      />
      <DataTableBulkActions table={table} entityName="bài Bạch thoại" />
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function WisdomDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useWisdom();
  const publishEntry = usePublishWisdomEntry();
  const deleteEntry = useDeleteWisdomEntry();

  const handleClose = () => { setOpen(null); setCurrentRow(null); };

  return (
    <>
      {currentRow && (
        <>
          <WorkspaceConfirmDialog
            open={open === "publish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
            title="Xuất bản bài Bạch thoại"
            description={
              <>
                Xuất bản{" "}
                <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Bài sẽ hiển thị công khai ngay lập tức.
              </>
            }
            confirmLabel="Xuất bản"
            isPending={publishEntry.isPending}
            onConfirm={() => publishEntry.mutate(currentRow.publicId, { onSuccess: handleClose })}
          />
          <WorkspaceConfirmDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            title="Xoá bài Bạch thoại"
            description={
              <>
                Xoá{" "}
                <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Thao tác này không thể hoàn tác.
              </>
            }
            confirmLabel="Xoá"
            variant="destructive"
            isPending={deleteEntry.isPending}
            onConfirm={() => deleteEntry.mutate(currentRow.publicId, { onSuccess: handleClose })}
          />
        </>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function WisdomPage() {
  const navigateTo = useNavigateTo();

  return (
    <WisdomProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bạch thoại Phật pháp</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Quản trị kho Bạch thoại, Khai thị, Phật ngôn và Bài pháp hội của PMTL.
            </p>
          </div>
          <Button onClick={() => navigateTo("/noi-dung/bach-thoai/tao-moi")}>
            <BookOpenIcon className="mr-2 size-4" />
            Thêm bài
          </Button>
        </div>

        <WisdomTable />
      </div>
      <WisdomDialogs />
    </WisdomProvider>
  );
}
