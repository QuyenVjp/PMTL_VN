import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, SendIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceRowActions,
} from "@/components/workspace";
import { eventListOptions, type CalendarEventItem } from "./queries.js";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  usePublishEvent,
  type CreateEventInput,
  type UpdateEventInput,
} from "./mutations.js";

// ── Context ──────────────────────────────────────────────────────────

type CalendarDialogType = "create" | "edit" | "publish" | "delete" | null;

type CalendarContextValue = {
  open: CalendarDialogType;
  currentRow: CalendarEventItem | null;
  setOpen: (value: CalendarDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<CalendarEventItem | null>>;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<CalendarDialogType>(null);
  const [currentRow, setCurrentRow] = useState<CalendarEventItem | null>(null);
  return (
    <CalendarContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </CalendarContext.Provider>
  );
}

function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────

const statusOptions = [
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã huỷ", value: "CANCELLED" },
];

const eventTypeOptions = [
  { label: "Lễ", value: "CEREMONY" },
  { label: "Khoá tu", value: "RETREAT" },
  { label: "Pháp thoại", value: "DHARMA_TALK" },
  { label: "Cộng đồng", value: "COMMUNITY" },
  { label: "Khác", value: "OTHER" },
];

function statusBadgeClass(status: string): string {
  if (status === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (status === "CANCELLED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  return "";
}

function statusLabel(status: string): string {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "DRAFT") return "Nháp";
  if (status === "CANCELLED") return "Đã huỷ";
  return status;
}

function eventTypeLabel(type: string): string {
  if (type === "CEREMONY") return "Lễ";
  if (type === "RETREAT") return "Khoá tu";
  if (type === "DHARMA_TALK") return "Pháp thoại";
  if (type === "COMMUNITY") return "Cộng đồng";
  if (type === "OTHER") return "Khác";
  return type;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function toLocalDatetimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

// ── Create / Edit form dialog ─────────────────────────────────────────

type EventFormState = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  eventType: string;
};

const EMPTY_FORM: EventFormState = {
  title: "",
  description: "",
  startAt: "",
  endAt: "",
  location: "",
  eventType: "CEREMONY",
};

function EventFormDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: CalendarEventItem | null;
}) {
  const isEdit = !!currentRow;
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const isPending = createEvent.isPending || updateEvent.isPending;

  const [form, setForm] = useState<EventFormState>(EMPTY_FORM);

  useEffect(() => {
    if (currentRow) {
      setForm({
        title: currentRow.title,
        description: currentRow.description ?? "",
        startAt: toLocalDatetimeValue(currentRow.startAt),
        endAt: toLocalDatetimeValue(currentRow.endAt),
        location: currentRow.location ?? "",
        eventType: currentRow.eventType,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [currentRow, open]);

  const handleSubmit = () => {
    if (!form.title.trim() || !form.startAt) {
      toast.error("Tiêu đề và thời gian bắt đầu không được để trống.");
      return;
    }

    const shared = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      location: form.location.trim() || undefined,
      eventType: form.eventType,
    };

    if (isEdit && currentRow) {
      updateEvent.mutate(
        { publicId: currentRow.publicId, input: shared as UpdateEventInput },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createEvent.mutate(shared as CreateEventInput, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const set = (key: keyof EventFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật thông tin sự kiện." : "Điền thông tin để tạo sự kiện mới."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Tiêu đề *">
            <Input value={form.title} onChange={set("title")} placeholder="Tên sự kiện..." />
          </Field>
          <Field label="Mô tả">
            <Textarea value={form.description} onChange={set("description")} placeholder="Mô tả sự kiện..." rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bắt đầu *">
              <Input type="datetime-local" value={form.startAt} onChange={set("startAt")} />
            </Field>
            <Field label="Kết thúc">
              <Input type="datetime-local" value={form.endAt} onChange={set("endAt")} />
            </Field>
          </div>
          <Field label="Địa điểm">
            <Input value={form.location} onChange={set("location")} placeholder="Nơi tổ chức..." />
          </Field>
          <Field label="Loại sự kiện *">
            <Select value={form.eventType} onValueChange={(v) => setForm((f) => ({ ...f, eventType: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.title.trim() || !form.startAt}>
            {isPending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo sự kiện"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Row actions ───────────────────────────────────────────────────────

function CalendarRowActions({ row }: { row: CalendarEventItem }) {
  const { setOpen, setCurrentRow } = useCalendar();

  const open = (dialog: "edit" | "publish" | "delete") => {
    setCurrentRow(row);
    setOpen(dialog);
  };

  const actions = [
    { label: "Chỉnh sửa", icon: PencilIcon, onClick: () => open("edit") },
    ...(row.status === "DRAFT"
      ? [{ label: "Xuất bản", icon: SendIcon, onClick: () => open("publish"), separator: true as const }]
      : []),
    { label: "Xoá", icon: Trash2Icon, onClick: () => open("delete"), variant: "destructive" as const, separator: true as const },
  ];

  return <WorkspaceRowActions actions={actions} />;
}

// ── Table ─────────────────────────────────────────────────────────────

function CalendarTable() {
  const { data: envelope, isLoading } = useQuery(eventListOptions({ limit: 100 }));
  const events = envelope?.data ?? [];

  const [sorting, setSorting] = useState<SortingState>([{ id: "startAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<CalendarEventItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
        cell: ({ row }) => (
          <div className="max-w-[240px] truncate font-medium">{row.original.title}</div>
        ),
        meta: { label: "Tiêu đề" },
        enableHiding: false,
      },
      {
        accessorKey: "eventType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">
            {eventTypeLabel(row.original.eventType)}
          </div>
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
        accessorKey: "startAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bắt đầu" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">
            {new Date(row.original.startAt).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        ),
        meta: { label: "Bắt đầu" },
      },
      {
        accessorKey: "location",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Địa điểm" />,
        cell: ({ row }) => (
          <div className="max-w-[180px] truncate text-sm text-muted-foreground">
            {row.original.location ?? "—"}
          </div>
        ),
        meta: { label: "Địa điểm" },
        enableSorting: false,
      },
      {
        accessorKey: "createdBy",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người tạo" />,
        cell: ({ row }) => (
          <div className="text-nowrap text-sm text-muted-foreground">
            {row.original.createdBy.displayName}
          </div>
        ),
        meta: { label: "Người tạo" },
        enableSorting: false,
      },
      {
        id: "actions",
        cell: ({ row }) => <CalendarRowActions row={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: events,
    columns,
    state: { sorting, columnFilters, rowSelection, columnVisibility },
    getRowId: (row) => row.publicId,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
        searchPlaceholder="Lọc theo tiêu đề..."
        searchKey="title"
        viewButtonLabel="Xem"
        filters={[
          { columnId: "status", title: "Trạng thái", options: statusOptions },
          { columnId: "eventType", title: "Loại sự kiện", options: eventTypeOptions },
        ]}
      />
      <WorkspaceDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có sự kiện nào."
      />
    </div>
  );
}

// ── Dialogs ───────────────────────────────────────────────────────────

function CalendarDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCalendar();
  const publishEvent = usePublishEvent();
  const deleteEvent = useDeleteEvent();

  const handleClose = () => {
    setOpen(null);
    setTimeout(() => setCurrentRow(null), 200);
  };

  return (
    <>
      <EventFormDialog
        open={open === "create"}
        onOpenChange={(v) => (!v ? handleClose() : setOpen("create"))}
        currentRow={null}
      />
      {currentRow && (
        <>
          <EventFormDialog
            open={open === "edit"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("edit"))}
            currentRow={currentRow}
          />
          <WorkspaceConfirmDialog
            open={open === "publish"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("publish"))}
            title="Xuất bản sự kiện"
            description={
              <>
                Xuất bản sự kiện{" "}
                <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Sự kiện sẽ hiển thị công khai.
              </>
            }
            confirmLabel="Xuất bản"
            isPending={publishEvent.isPending}
            onConfirm={() =>
              publishEvent.mutate(currentRow.publicId, { onSuccess: handleClose })
            }
          />
          <WorkspaceConfirmDialog
            open={open === "delete"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("delete"))}
            title="Xoá sự kiện"
            description={
              <>
                Xoá sự kiện{" "}
                <span className="font-semibold text-foreground">{currentRow.title}</span>?
                Thao tác này không thể hoàn tác.
              </>
            }
            confirmLabel="Xoá"
            variant="destructive"
            isPending={deleteEvent.isPending}
            onConfirm={() =>
              deleteEvent.mutate(currentRow.publicId, { onSuccess: handleClose })
            }
          />
        </>
      )}
    </>
  );
}

// ── Primary buttons ───────────────────────────────────────────────────

function CalendarPrimaryButtons() {
  const { setOpen } = useCalendar();
  return (
    <Button onClick={() => setOpen("create")}>
      <PlusIcon className="size-4" />
      Tạo sự kiện
    </Button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function CalendarEventsPage() {
  return (
    <CalendarProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lịch & Sự kiện</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Quản trị sự kiện, lịch hoạt động và xuất bản.
            </p>
          </div>
          <CalendarPrimaryButtons />
        </div>

        <CalendarTable />
      </div>

      <CalendarDialogs />
    </CalendarProvider>
  );
}
