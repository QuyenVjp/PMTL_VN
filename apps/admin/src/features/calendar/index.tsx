import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { PencilIcon, PlusIcon, SendIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";

import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  WorkspaceRowActions,
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
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation.js";
import { mediaListOptions, type MediaAssetListItem } from "@/features/media/queries.js";
import { useUploadMediaAsset } from "@/features/media/mutations.js";
import { resolveMediaSrc } from "@/lib/media-src";
import { ImageAssetPicker } from "@/components/media/image-asset-picker";
import { extractUploadMediaPayload } from "@/lib/media-upload";
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const uploadMedia = useUploadMediaAsset();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const { data: mediaEnvelope } = useQuery({
    ...mediaListOptions({ limit: 100, mimeType: "image/" }),
    enabled: open,
  });
  const imageAssets = useMemo(
    () => (mediaEnvelope?.data ?? []).filter((item: MediaAssetListItem) => item.mimeType.startsWith("image/")),
    [mediaEnvelope],
  );

  useEffect(() => {
    if (currentRow) {
      setForm({
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
      setForm(EMPTY_FORM);
    }
    setFieldErrors({});
  }, [currentRow, open]);

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!form.title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (!form.startAt) nextErrors.startAt = "Thời gian bắt đầu không được để trống.";
    if (hasFieldErrors(nextErrors)) { setFieldErrors(nextErrors); toast.error(Object.values(nextErrors)[0]); return; }
    setFieldErrors({});

    const shared = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      location: form.location.trim() || undefined,
      eventType: form.eventType,
      coverImagePublicId: form.coverImagePublicId || undefined,
      posterImagePublicId: form.posterImagePublicId || undefined,
    };

    if (isEdit && currentRow) {
      updateEvent.mutate(
        { publicId: currentRow.publicId, input: shared as UpdateEventInput },
        {
          onSuccess: () => onOpenChange(false),
          onError: (error) => setFieldErrors(extractValidationFieldErrors(error)),
        },
      );
    } else {
      createEvent.mutate(shared as CreateEventInput, {
        onSuccess: () => onOpenChange(false),
        onError: (error) => setFieldErrors(extractValidationFieldErrors(error)),
      });
    }
  };

  const set = (key: keyof EventFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleUploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    key: "coverImagePublicId" | "posterImagePublicId",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadMedia.mutateAsync(file);
      const publicId = extractUploadMediaPayload(result)?.publicId;
      if (publicId) {
        setForm((f) => ({ ...f, [key]: publicId }));
      }
    } finally {
      event.target.value = "";
    }
  };

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
            <Input
              value={form.title}
              onChange={(e) => {
                set("title")(e);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Tên sự kiện..."
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </Field>
          <Field label="Mô tả">
            <Textarea value={form.description} onChange={set("description")} placeholder="Mô tả sự kiện..." rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bắt đầu *">
              <DateTimeField
                value={form.startAt}
                onChange={(next) => {
                  setForm((f) => ({ ...f, startAt: next }));
                  if (fieldErrors.startAt) setFieldErrors((prev) => ({ ...prev, startAt: "" }));
                }}
                placeholder="Chọn ngày bắt đầu"
                invalid={Boolean(fieldErrors.startAt)}
              />
              <FieldError message={fieldErrors.startAt} />
            </Field>
            <Field label="Kết thúc">
              <DateTimeField
                value={form.endAt}
                onChange={(next) => setForm((f) => ({ ...f, endAt: next }))}
                placeholder="Chọn ngày kết thúc"
              />
            </Field>
          </div>
          <Field label="Địa điểm">
            <Input value={form.location} onChange={set("location")} placeholder="Nơi tổ chức..." />
          </Field>
          <Field label="Ảnh cover sự kiện">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleUploadImage(event, "coverImagePublicId")}
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => coverInputRef.current?.click()}>
                Upload ảnh mới
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setForm((f) => ({ ...f, coverImagePublicId: "" }))}
                disabled={!form.coverImagePublicId}
              >
                Bỏ chọn
              </Button>
            </div>
            <ImageAssetPicker
              assets={imageAssets}
              value={form.coverImagePublicId}
              onChange={(publicId) => setForm((f) => ({ ...f, coverImagePublicId: publicId }))}
              placeholder="Chọn ảnh cover từ thư viện..."
            />
          </Field>
          <Field label="Ảnh poster sự kiện">
            <input
              ref={posterInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleUploadImage(event, "posterImagePublicId")}
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => posterInputRef.current?.click()}>
                Upload ảnh mới
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setForm((f) => ({ ...f, posterImagePublicId: "" }))}
                disabled={!form.posterImagePublicId}
              >
                Bỏ chọn
              </Button>
            </div>
            <ImageAssetPicker
              assets={imageAssets}
              value={form.posterImagePublicId}
              onChange={(publicId) => setForm((f) => ({ ...f, posterImagePublicId: publicId }))}
              placeholder="Chọn ảnh poster từ thư viện..."
            />
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
  const { data: mediaEnvelope } = useQuery(mediaListOptions({ limit: 200, mimeType: "image/" }));
  const mediaUrlByPublicId = useMemo(() => {
    const map = new Map<string, string>();
    for (const asset of mediaEnvelope?.data ?? []) {
      const typedAsset = asset as MediaAssetListItem;
      if (typedAsset.publicId) map.set(typedAsset.publicId, typedAsset.url);
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



