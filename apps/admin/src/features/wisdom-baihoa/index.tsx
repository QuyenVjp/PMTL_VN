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
import { toast } from "sonner";
import { BookOpenIcon, CheckCircle2Icon, CheckCircleIcon, LoaderCircleIcon, PencilIcon, SparklesIcon, Trash2Icon, XCircleIcon } from "lucide-react";
import { useSlugField, type SlugStatus } from "@/lib/hooks/use-slug-field";

function SlugStatusIcon({ status }: { status: SlugStatus }) {
  if (status === "checking") return <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />;
  if (status === "available") return <CheckCircle2Icon className="size-4 text-emerald-500" />;
  if (status === "taken") return <XCircleIcon className="size-4 text-destructive" />;
  return null;
}

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
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
import { FieldError } from "@/components/ui/field-error";
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
import { useNavigateTo } from "@/lib/router-utils";
import { createSelectColumn } from "@/lib/table/select-column";
import { wisdomEntryListOptions, type WisdomEntryItem } from "./queries";
import {
  useCreateWisdomEntry,
  useUpdateWisdomEntry,
  usePublishWisdomEntry,
  useDeleteWisdomEntry,
  useCreateWisdomTranslationDraft,
} from "./mutations";
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation.js";

// ── Context ───────────────────────────────────────────────────────────

type WisdomDialogType = "edit" | "publish" | "delete" | null;

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

// ── Field wrapper ────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

// ── Row actions ───────────────────────────────────────────────────────

function WisdomRowActions({ row }: { row: WisdomEntryItem }) {
  const { setOpen, setCurrentRow } = useWisdom();
  const open = (dialog: WisdomDialogType) => { setCurrentRow(row); setOpen(dialog); };
  return (
    <WorkspaceRowActions
      actions={[
        { label: "Chỉnh sửa", icon: PencilIcon, onClick: () => open("edit") },
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

// ── Create dialog ────────────────────────────────────────────────────

export function WisdomCreateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const create = useCreateWisdomEntry();
  const createDraft = useCreateWisdomTranslationDraft();
  const [title, setTitle] = useState("");
  const { slug, setSlug, resetSlug, slugStatus } = useSlugField({ title, entityType: "WISDOM" });
  const [entryType, setEntryType] = useState<"BACH_THOAI" | "KHAI_THI" | "PHAT_NGON" | "PHAP_HOI">("BACH_THOAI");
  const [sourceCode, setSourceCode] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const reset = () => {
    setTitle("");
    resetSlug();
    setEntryType("BACH_THOAI");
    setSourceCode("");
    setSourceUrl("");
    setOriginalText("");
    setTranslatedText("");
    setFieldErrors({});
  };

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (slugStatus === "taken") nextErrors.slug = "Slug này đã được dùng, hãy chỉnh lại.";
    if (hasFieldErrors(nextErrors)) { setFieldErrors(nextErrors); toast.error(Object.values(nextErrors)[0]); return; }
    setFieldErrors({});
    create.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        entryType,
        sourceCode: sourceCode.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        originalText: originalText.trim() || undefined,
        translatedText: translatedText.trim() || undefined,
      },
      {
        onSuccess: () => { reset(); onOpenChange(false); },
        onError: (error) => { setFieldErrors(extractValidationFieldErrors(error)); },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Thêm bài Bạch thoại</DialogTitle>
          <DialogDescription>Tạo bài mới cho Bạch thoại, Khai thị hoặc Phật ngôn để biên tập tiếp sau đó.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Tiêu đề">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Nhập tiêu đề..."
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </Field>
          <Field label="Slug">
            <div className="relative">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tu-dong-tao-neu-de-trong"
                className={invalidFieldClass(slugStatus === "taken")}
                style={{ paddingRight: slugStatus !== "idle" ? "2.25rem" : undefined }}
              />
              {slugStatus !== "idle" && (
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <SlugStatusIcon status={slugStatus} />
                </span>
              )}
            </div>
            <FieldError message={fieldErrors.slug} />
          </Field>
          <Field label="Loại bài">
            <Select value={entryType} onValueChange={(v) => setEntryType(v as typeof entryType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {entryTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã nguồn" hint="VD: shuohua20140808">
              <Input value={sourceCode} onChange={(e) => setSourceCode(e.target.value)} placeholder="Mã bài gốc..." />
            </Field>
            <Field label="URL nguồn">
              <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
            </Field>
          </div>
          <Field label="Nguyên văn gốc">
            <Textarea value={originalText} onChange={(e) => setOriginalText(e.target.value)} placeholder="Văn bản gốc..." rows={4} />
          </Field>
          <Field label="Bản dịch tiếng Việt">
            <div className="grid gap-2">
              <Textarea value={translatedText} onChange={(e) => setTranslatedText(e.target.value)} placeholder="Bản dịch nháp..." rows={4} />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={createDraft.isPending || !originalText.trim()}
                  onClick={() =>
                    createDraft.mutate(
                      {
                        originalText: originalText.trim(),
                        title: title.trim() || undefined,
                        sourceCode: sourceCode.trim() || undefined,
                      },
                      {
                        onSuccess: (res) => {
                          setTranslatedText(res.translatedText);
                          toast.success("Đã tạo bản dịch nháp.");
                        },
                      },
                    )
                  }
                >
                  <SparklesIcon className="mr-1 size-4" />
                  {createDraft.isPending ? "Đang dịch..." : "Tạo bản dịch nháp"}
                </Button>
              </div>
            </div>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={create.isPending || !title.trim()}>
            {create.isPending ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit dialog ───────────────────────────────────────────────────────

function WisdomEditDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRow: WisdomEntryItem;
}) {
  const update = useUpdateWisdomEntry();
  const createDraft = useCreateWisdomTranslationDraft();
  const [title, setTitle] = useState(currentRow.title);
  const { slug, setSlug, slugStatus } = useSlugField({ title, entityType: "WISDOM", excludePublicId: currentRow.publicId });
  const [entryType, setEntryType] = useState(currentRow.entryType);
  const [sourceCode, setSourceCode] = useState(currentRow.sourceCode ?? "");
  const [sourceUrl, setSourceUrl] = useState(currentRow.sourceUrl ?? "");
  const [sourceFamily, setSourceFamily] = useState(currentRow.sourceFamily ?? "");
  const [originalText, setOriginalText] = useState(currentRow.originalText ?? "");
  const [translatedText, setTranslatedText] = useState(currentRow.translatedText ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  React.useEffect(() => {
    setTitle(currentRow.title);
    setSlug(currentRow.slug);
    setEntryType(currentRow.entryType);
    setSourceCode(currentRow.sourceCode ?? "");
    setSourceUrl(currentRow.sourceUrl ?? "");
    setSourceFamily(currentRow.sourceFamily ?? "");
    setOriginalText(currentRow.originalText ?? "");
    setTranslatedText(currentRow.translatedText ?? "");
    setFieldErrors({});
  }, [currentRow, open]);

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (slugStatus === "taken") nextErrors.slug = "Slug này đã được dùng, hãy chỉnh lại.";
    if (hasFieldErrors(nextErrors)) { setFieldErrors(nextErrors); toast.error(Object.values(nextErrors)[0]); return; }
    setFieldErrors({});
    update.mutate(
      {
        publicId: currentRow.publicId,
        title: title.trim(),
        slug: slug.trim() || undefined,
        entryType,
        sourceCode: sourceCode.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        sourceFamily: sourceFamily.trim() || undefined,
        originalText: originalText.trim() || undefined,
        translatedText: translatedText.trim() || undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => { setFieldErrors(extractValidationFieldErrors(error)); },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-start">
          <DialogTitle>Chỉnh sửa bài Bạch thoại</DialogTitle>
          <DialogDescription>Cập nhật thông tin nguồn và nội dung dịch của bài.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <Field label="Tiêu đề">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </Field>
          <Field label="Slug">
            <div className="relative">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="duong-dan-bai-viet"
                className={invalidFieldClass(slugStatus === "taken")}
                style={{ paddingRight: slugStatus !== "idle" ? "2.25rem" : undefined }}
              />
              {slugStatus !== "idle" && (
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <SlugStatusIcon status={slugStatus} />
                </span>
              )}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại bài">
              <Select value={entryType} onValueChange={(v) => setEntryType(v as typeof entryType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {entryTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Nguồn gốc">
              <Input value={sourceFamily} onChange={(e) => setSourceFamily(e.target.value)} placeholder="VD: community_translation" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã nguồn">
              <Input value={sourceCode} onChange={(e) => setSourceCode(e.target.value)} placeholder="shuohua20140808" />
            </Field>
            <Field label="URL nguồn">
              <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
            </Field>
          </div>
          <Field label="Nguyên văn gốc">
            <Textarea value={originalText} onChange={(e) => setOriginalText(e.target.value)} placeholder="Văn bản gốc (Hoa văn)..." rows={4} />
          </Field>
          <Field label="Bản dịch tiếng Việt">
            <div className="grid gap-2">
              <Textarea value={translatedText} onChange={(e) => setTranslatedText(e.target.value)} placeholder="Bản dịch Việt..." rows={4} />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={createDraft.isPending || !originalText.trim()}
                  onClick={() =>
                    createDraft.mutate(
                      {
                        originalText: originalText.trim(),
                        title: title.trim() || undefined,
                        sourceCode: sourceCode.trim() || undefined,
                      },
                      {
                        onSuccess: (res) => {
                          setTranslatedText(res.translatedText);
                          toast.success("Đã tạo bản dịch nháp.");
                        },
                      },
                    )
                  }
                >
                  <SparklesIcon className="mr-1 size-4" />
                  {createDraft.isPending ? "Đang dịch..." : "Tạo bản dịch nháp"}
                </Button>
              </div>
            </div>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={update.isPending || !title.trim()}>
            {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Table ─────────────────────────────────────────────────────────────

function WisdomTable() {
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
          <WisdomEditDialog
            open={open === "edit"}
            onOpenChange={(v) => (!v ? handleClose() : setOpen("edit"))}
            currentRow={currentRow}
          />
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
