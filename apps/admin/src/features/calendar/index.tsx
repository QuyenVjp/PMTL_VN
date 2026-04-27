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
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { AlertTriangleIcon, CalendarClockIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, ListIcon, PlusIcon, SendIcon, Trash2Icon, WorkflowIcon } from "lucide-react";
import { z } from "zod";
import { FieldError } from "@/components/ui/field-error";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import {
  WorkspaceConfirmDialog,
  WorkspaceDataTable,
  WorkspaceDetailSection,
  WorkspaceDetailSheet,
  WorkspaceRowActions,
  WorkspaceScopeCards,
} from "@/components/workspace";
import { createSelectColumn } from "@/lib/table/select-column";
import { eventListOptions, type CalendarEventItem } from "./queries.js";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  usePublishEvent,
  type CreateEventInput,
  type UpdateEventInput,
} from "./mutations.js";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation.js";
import { mediaListOptions } from "@/features/media/queries.js";
import { resolveMediaSrc } from "@/lib/media-src";
import { MediaPickerField } from "@/components/media/media-picker-modal";
import { cn } from "@/lib/utils";

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

function DateTimeField({
  value,
  onChange,
  placeholder,
  invalid,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  invalid?: boolean;
}) {
  const parsed = parseLocalDateTime(value);
  const timeValue = parsed
    ? `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`
    : "00:00";

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn("justify-start text-left font-normal", invalid && "border-destructive")}
          >
            {value ? formatDateTimeDisplay(value) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <DateCalendar
              mode="single"
              selected={parsed}
              onSelect={(date) => {
                if (!date) return;
                onChange(mergeDateTimePart(value, date));
              }}
            />
            <Input
              type="time"
              value={timeValue}
              onChange={(event) => {
                onChange(mergeDateTimePart(value, undefined, event.target.value));
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function toLocalDatetimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

function parseLocalDateTime(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function formatDateTimeDisplay(value: string): string {
  const parsed = parseLocalDateTime(value);
  if (!parsed) return "Chọn ngày giờ";
  return parsed.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mergeDateTimePart(value: string, nextDate?: Date, nextTime?: string): string {
  const base = parseLocalDateTime(value) ?? new Date();
  const merged = new Date(base);
  if (nextDate) {
    merged.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
  }
  if (nextTime) {
    const [h, m] = nextTime.split(":");
    merged.setHours(Number(h), Number(m), 0, 0);
  }
  return new Date(merged.getTime() - merged.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

// ── Create / Edit form dialog ─────────────────────────────────────────

type EventFormState = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  eventType: string;
  coverImagePublicId: string;
  posterImagePublicId: string;
};

const EMPTY_FORM: EventFormState = {
  title: "",
  description: "",
  startAt: "",
  endAt: "",
  location: "",
  eventType: "CEREMONY",
  coverImagePublicId: "",
  posterImagePublicId: "",
};

const eventFormSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  description: z.string().trim().optional(),
  startAt: z.string().trim().min(1, "Thời gian bắt đầu không được để trống."),
  endAt: z.string().trim().optional(),
  location: z.string().trim().optional(),
  eventType: z.string().trim().min(1),
  coverImagePublicId: z.string().trim().optional(),
  posterImagePublicId: z.string().trim().optional(),
});

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

  const form = useAdminZodForm(eventFormSchema, { defaultValues: EMPTY_FORM });
  const { errors } = form.formState;
  const values = form.watch();
  useEffect(() => {
    if (currentRow) {
      form.reset({
        title: currentRow.title,
        description: currentRow.description ?? "",
        startAt: toLocalDatetimeValue(currentRow.startAt),
        endAt: toLocalDatetimeValue(currentRow.endAt),
        location: currentRow.location ?? "",
        eventType: currentRow.eventType,
        coverImagePublicId: currentRow.coverImagePublicId ?? "",
        posterImagePublicId: currentRow.posterImagePublicId ?? "",
      });
    } else {
      form.reset(EMPTY_FORM);
    }
  }, [currentRow, form, open]);

  const handleSubmit = form.handleSubmit((formValues) => {
    const shared = {
      title: formValues.title,
      description: formValues.description || undefined,
      startAt: new Date(formValues.startAt).toISOString(),
      endAt: formValues.endAt ? new Date(formValues.endAt).toISOString() : undefined,
      location: formValues.location || undefined,
      eventType: formValues.eventType,
      coverImagePublicId: formValues.coverImagePublicId || undefined,
      posterImagePublicId: formValues.posterImagePublicId || undefined,
    };

    if (isEdit && currentRow) {
      updateEvent.mutate(
        { publicId: currentRow.publicId, input: shared as UpdateEventInput },
        {
          onSuccess: () => onOpenChange(false),
          onError: (error) => {
            applyApiFieldErrors(form, error);
          },
        },
      );
    } else {
      createEvent.mutate(shared as CreateEventInput, {
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      });
    }
  });

  return (
    <WorkspaceDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? currentRow.title : "Tạo sự kiện mới"}
      subtitle={isEdit ? "Xem chi tiết và cập nhật thông tin sự kiện." : "Điền thông tin để tạo sự kiện mới."}
    >

        <WorkspaceDetailSection title="Thông tin" className="space-y-4">
          <FieldError message={errors.root?.server?.message} />
          <Field label="Tiêu đề *">
            <Input
              {...form.register("title")}
              placeholder="Tên sự kiện..."
              className={invalidFieldClass(Boolean(errors.title))}
            />
            <FieldError message={errors.title?.message} />
          </Field>
          <Field label="Mô tả">
            <Textarea {...form.register("description")} placeholder="Mô tả sự kiện..." rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bắt đầu *">
              <DateTimeField
                value={values.startAt ?? ""}
                onChange={(next) => {
                  form.setValue("startAt", next, { shouldDirty: true, shouldValidate: true });
                }}
                placeholder="Chọn ngày bắt đầu"
                invalid={Boolean(errors.startAt)}
              />
              <FieldError message={errors.startAt?.message} />
            </Field>
            <Field label="Kết thúc">
              <DateTimeField
                value={values.endAt ?? ""}
                onChange={(next) => form.setValue("endAt", next, { shouldDirty: true, shouldValidate: true })}
                placeholder="Chọn ngày kết thúc"
              />
            </Field>
          </div>
          <Field label="Địa điểm">
            <Input {...form.register("location")} placeholder="Nơi tổ chức..." />
          </Field>
        </WorkspaceDetailSection>

        <WorkspaceDetailSection title="Biên tập" className="space-y-4">
          <Field label="Ảnh cover sự kiện">
            <MediaPickerField
              value={values.coverImagePublicId ?? ""}
              onChange={(publicId) => form.setValue("coverImagePublicId", publicId, { shouldDirty: true, shouldValidate: true })}
              placeholder="Chọn ảnh cover từ thư viện..."
            />
          </Field>
          <Field label="Ảnh poster sự kiện">
            <MediaPickerField
              value={values.posterImagePublicId ?? ""}
              onChange={(publicId) => form.setValue("posterImagePublicId", publicId, { shouldDirty: true, shouldValidate: true })}
              placeholder="Chọn ảnh poster từ thư viện..."
            />
          </Field>
          <Field label="Loại sự kiện *">
            <Select value={values.eventType ?? "CEREMONY"} onValueChange={(v) => form.setValue("eventType", v, { shouldDirty: true, shouldValidate: true })}>
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
        </WorkspaceDetailSection>

        {isEdit && currentRow ? (
          <WorkspaceDetailSection title="Audit">
            <dl className="grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Người tạo</dt>
                <dd className="font-medium">{currentRow.createdBy.displayName}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Ngày tạo</dt>
                <dd className="font-medium">{new Date(currentRow.createdAt).toLocaleString("vi-VN")}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Xuất bản</dt>
                <dd className="font-medium">
                  {currentRow.publishedAt ? new Date(currentRow.publishedAt).toLocaleString("vi-VN") : "Chưa xuất bản"}
                </dd>
              </div>
            </dl>
          </WorkspaceDetailSection>
        ) : null}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={() => void handleSubmit()} disabled={isPending || !values.title.trim() || !values.startAt}>
            {isPending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo sự kiện"}
          </Button>
        </div>
    </WorkspaceDetailSheet>
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
    { label: "Xem chi tiết", icon: EyeIcon, onClick: () => open("edit") },
    ...(row.status === "DRAFT"
      ? [{ label: "Xuất bản", icon: SendIcon, onClick: () => open("publish"), separator: true as const }]
      : []),
    { label: "Xoá", icon: Trash2Icon, onClick: () => open("delete"), variant: "destructive" as const, separator: true as const },
  ];

  return <WorkspaceRowActions actions={actions} />;
}

// ── Table ─────────────────────────────────────────────────────────────

function CalendarTable() {
  const { setOpen, setCurrentRow } = useCalendar();
  const { data: envelope, isLoading } = useQuery(eventListOptions({ limit: 100 }));
  const events = envelope?.data ?? [];
  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 100, mimeType: "image/" }));
  const mediaUrlByPublicId = useMemo(() => {
    const map = new Map<string, string>();
    for (const asset of mediaEnvelope?.data ?? []) {
      if (asset.publicId) map.set(asset.publicId, asset.url);
    }
    return map;
  }, [mediaEnvelope]);

  const [sorting, setSorting] = useState<SortingState>([{ id: "startAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<CalendarEventItem>[]>(
    () => [
      createSelectColumn<CalendarEventItem>(),
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 max-w-[260px]">
            {row.original.coverImageUrl ? (
              <img
                src={resolveMediaSrc(row.original.coverImageUrl) ?? undefined}
                alt={row.original.title}
                className="size-8 shrink-0 rounded border object-cover"
                loading="lazy"
              />
            ) : row.original.coverImagePublicId ? (
              <img
                src={resolveMediaSrc(mediaUrlByPublicId.get(row.original.coverImagePublicId)) ?? undefined}
                alt={row.original.title}
                className="size-8 shrink-0 rounded border object-cover"
                loading="lazy"
              />
            ) : null}
            <div className="truncate font-medium">{row.original.title}</div>
          </div>
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
    [mediaUrlByPublicId],
  );

  const table = useSafeReactTable({
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
        onRowClick={(row) => {
          setCurrentRow(row);
          setOpen("edit");
        }}
      />
      <DataTableBulkActions table={table} entityName="sự kiện" />
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
    setCurrentRow(null);
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

// ── Month view ────────────────────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  CEREMONY: "bg-amber-400/90 text-amber-950",
  RETREAT: "bg-emerald-400/90 text-emerald-950",
  DHARMA_TALK: "bg-blue-400/90 text-blue-950",
  COMMUNITY: "bg-purple-400/90 text-purple-950",
  OTHER: "bg-slate-400/90 text-slate-950",
};

const VI_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const VI_MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function CalendarMonthView({ events }: { events: CalendarEventItem[] }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const { setOpen, setCurrentRow } = useCalendar();

  // Build grid: cells are null (empty leading) or day number
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay(); // Sun=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEventItem[]>();
    for (const event of events) {
      const d = new Date(event.startAt);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        const day = d.getDate();
        const bucket = map.get(day);
        if (bucket) {
          bucket.push(event);
        } else {
          map.set(day, [event]);
        }
      }
    }
    return map;
  }, [events, viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between border-b bg-card px-4 py-3">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="text-sm font-semibold">
          {VI_MONTHS[viewMonth]} {viewYear}
        </span>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {VI_DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 bg-card">
        {cells.map((day, idx) => {
          const isToday =
            day !== null &&
            today.getDate() === day &&
            today.getMonth() === viewMonth &&
            today.getFullYear() === viewYear;
          const dayEvents = day !== null ? (eventsByDay.get(day) ?? []) : [];

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[84px] border-b border-r p-1",
                "last-of-type:border-r-0",
                !day && "bg-muted/10",
                // remove right border on every 7th cell
                (idx + 1) % 7 === 0 && "border-r-0",
              )}
            >
              {day !== null && (
                <>
                  <div
                    className={cn(
                      "mb-1 flex size-6 items-center justify-center rounded-full text-xs",
                      isToday
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <button
                        key={ev.publicId}
                        type="button"
                        className={cn(
                          "w-full truncate rounded px-1 py-0.5 text-left text-[11px] font-medium leading-tight",
                          EVENT_TYPE_COLORS[ev.eventType] ?? "bg-muted text-foreground",
                        )}
                        title={ev.title}
                        onClick={() => {
                          setCurrentRow(ev);
                          setOpen("edit");
                        }}
                      >
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="px-1 text-[10px] text-muted-foreground">
                        +{dayEvents.length - 2} khác
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 border-t bg-muted/20 px-4 py-2.5">
        {Object.entries(EVENT_TYPE_COLORS).map(([key, cls]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2.5 rounded-sm", cls.split(" ")[0])} />
            {eventTypeLabel(key)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Primary buttons ───────────────────────────────────────────────────

function CalendarPrimaryButtons({ view, onViewChange }: { view: "calendar" | "table"; onViewChange: (v: "calendar" | "table") => void }) {
  const { setOpen } = useCalendar();
  return (
    <div className="flex items-center gap-2">
      {/* View toggle */}
      <div className="flex items-center rounded-md border bg-muted/30 p-0.5">
        <Button
          variant={view === "calendar" ? "default" : "ghost"}
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() => onViewChange("calendar")}
        >
          <CalendarDaysIcon className="size-3.5" />
          Lịch
        </Button>
        <Button
          variant={view === "table" ? "default" : "ghost"}
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() => onViewChange("table")}
        >
          <ListIcon className="size-3.5" />
          Danh sách
        </Button>
      </div>
      <Button onClick={() => setOpen("create")}>
        <PlusIcon className="size-4" />
        Tạo sự kiện
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function CalendarEventsPage() {
  const [view, setView] = useState<"calendar" | "table">("calendar");
  const { data: envelope, isLoading } = useQuery(eventListOptions({ limit: 200 }));
  const events = envelope?.data ?? [];

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
          <CalendarPrimaryButtons view={view} onViewChange={setView} />
        </div>

        <WorkspaceScopeCards
          items={[
            {
              title: "Calendar owner",
              description: "Trang này quản trị lịch hiển thị, thời gian, trạng thái xuất bản và ảnh sự kiện.",
              badge: "Calendar events",
              icon: CalendarClockIcon,
            },
            {
              title: "Tách event domain",
              description: "Các workflow check-in, đăng ký, vi phạm hoặc monetization không nằm trong page lịch này.",
              badge: "Route boundary",
              icon: WorkflowIcon,
            },
            {
              title: "Date picker chuẩn",
              description: "Tạo/sửa sự kiện dùng popover calendar kèm giờ, không dùng input date/time trần.",
              badge: "shadcn Calendar",
              icon: AlertTriangleIcon,
            },
          ]}
        />

        {view === "calendar" ? (
          isLoading ? (
            <div className="grid gap-2 rounded-lg border bg-card p-4">
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <Skeleton key={`${rowIndex}-${cellIndex}`} className="h-20 w-full" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <CalendarMonthView events={events} />
          )
        ) : (
          <CalendarTable />
        )}
      </div>

      <CalendarDialogs />
    </CalendarProvider>
  );
}
