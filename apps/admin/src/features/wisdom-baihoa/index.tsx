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
import { BookOpenIcon, CheckCircleIcon, PencilIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { DataTableBulkActions, DataTableColumnHeader, DataTableToolbar } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { authorityProfileListOptions, wisdomEntryListOptions, type WisdomEntryItem } from "./queries";
import {
  useCreateWisdomEntry,
  useUpdateWisdomEntry,
  usePublishWisdomEntry,
  useDeleteWisdomEntry,
  useSuggestWisdomSlug,
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
const EXCERPT_MAX_LENGTH = 500;

function entryTypeLabel(t: string): string {
  return entryTypeOptions.find((o) => o.value === t)?.label ?? t;
}

const statusOptions = [
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Lưu trữ", value: "ARCHIVED" },
];

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

function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function excerptPreview(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function WisdomVideoDeck({ entries }: { entries: WisdomEntryItem[] }) {
  const [activeType, setActiveType] = useState<"ALL" | WisdomEntryItem["entryType"]>("ALL");
  const [selectedPublicId, setSelectedPublicId] = useState<string | null>(null);

  const videoEntries = useMemo(
    () =>
      entries
        .filter((entry) => getYouTubeId(entry.sourceUrl))
        .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime()),
    [entries],
  );

  const typeOptions = useMemo<Array<"ALL" | WisdomEntryItem["entryType"]>>(() => {
    const seen = new Set(videoEntries.map((entry) => entry.entryType));
    return [
      "ALL",
      ...entryTypeOptions
        .filter((option) => seen.has(option.value as WisdomEntryItem["entryType"]))
        .map((option) => option.value as WisdomEntryItem["entryType"]),
    ];
  }, [videoEntries]);

  const filteredEntries = useMemo(() => {
    if (activeType === "ALL") return videoEntries;
    return videoEntries.filter((entry) => entry.entryType === activeType);
  }, [activeType, videoEntries]);

  const selectedEntry =
    filteredEntries.find((entry) => entry.publicId === selectedPublicId) ??
    filteredEntries[0] ??
    null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-base">Kho video Bạch thoại / Khai thị</CardTitle>
            <CardDescription>
              Surface này ưu tiên bài có `URL nguồn` YouTube để admin nhìn đúng logic player, thumbnail và loại nội dung thay vì màn hình mô tả trống.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((type) => (
              <Button
                key={type}
                type="button"
                variant={activeType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveType(type)}
              >
                {type === "ALL" ? "Tất cả video" : entryTypeLabel(type)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedEntry ? (
            <>
              <div className="overflow-hidden rounded-xl border">
                <div className="aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedEntry.sourceUrl) ?? ""}?rel=0`}
                    title={selectedEntry.title}
                    className="size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="grid gap-3 border-t px-4 py-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{entryTypeLabel(selectedEntry.entryType)}</Badge>
                      <Badge variant="outline" className={statusBadgeClass(selectedEntry.status)}>
                        {statusLabel(selectedEntry.status)}
                      </Badge>
                      {selectedEntry.sourceCode ? (
                        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {selectedEntry.sourceCode}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-xl font-semibold">{selectedEntry.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {excerptPreview(selectedEntry.excerpt) || "Chưa có tóm tắt cho entry này."}
                    </p>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground lg:text-right">
                    <div>Tạo bởi {selectedEntry.author.displayName}</div>
                    <div>{new Date(selectedEntry.publishedAt ?? selectedEntry.createdAt).toLocaleString("vi-VN")}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {filteredEntries.slice(0, 8).map((entry) => {
                  const youtubeId = getYouTubeId(entry.sourceUrl);
                  if (!youtubeId) return null;

                  const isActive = selectedEntry.publicId === entry.publicId;
                  return (
                    <button
                      key={entry.publicId}
                      type="button"
                      onClick={() => setSelectedPublicId(entry.publicId)}
                      className={cn(
                        "overflow-hidden rounded-xl border text-left transition hover:border-primary/50",
                        isActive && "border-primary ring-1 ring-primary/30",
                      )}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`}
                        alt={entry.title}
                        className="aspect-video w-full object-cover"
                        loading="lazy"
                      />
                      <div className="space-y-2 px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{entryTypeLabel(entry.entryType)}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.publishedAt ?? entry.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm font-medium">{entry.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed px-4 py-10 text-sm text-muted-foreground">
              Chưa có bài nào có `URL nguồn` YouTube để dựng player. Hãy tạo bài mới bằng form full-page và dán link nguồn video.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
  const suggestSlug = useSuggestWisdomSlug();
  const createDraft = useCreateWisdomTranslationDraft();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [entryType, setEntryType] = useState<"BACH_THOAI" | "KHAI_THI" | "PHAT_NGON" | "PHAP_HOI">("BACH_THOAI");
  const [sourceCode, setSourceCode] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const reset = () => {
    setTitle("");
    setSlug("");
    setEntryType("BACH_THOAI");
    setSourceCode("");
    setSourceUrl("");
    setOriginalText("");
    setTranslatedText("");
    setExcerpt("");
    setFieldErrors({});
  };

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (excerpt.trim().length > EXCERPT_MAX_LENGTH) nextErrors.excerpt = "Tóm tắt tối đa 500 ký tự.";
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
        excerpt: excerpt.trim() || undefined,
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
            <div className="flex gap-2">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="tu-dong-tao-neu-de-trong" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={suggestSlug.isPending || !title.trim()}
                onClick={() =>
                  suggestSlug.mutate(
                    { title: title.trim(), sourceCode: sourceCode.trim() || undefined },
                    {
                      onSuccess: (res) => {
                        setSlug(res.slug);
                        toast.success("Đã gợi ý slug.");
                      },
                    },
                  )
                }
              >
                <SparklesIcon className="mr-1 size-4" />
                {suggestSlug.isPending ? "Đang gợi ý..." : "Gợi ý slug"}
              </Button>
            </div>
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
          <Field label="Tóm tắt">
            <Textarea
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                if (fieldErrors.excerpt) setFieldErrors((prev) => ({ ...prev, excerpt: "" }));
              }}
              placeholder="Mô tả ngắn..."
              maxLength={EXCERPT_MAX_LENGTH}
              className={invalidFieldClass(Boolean(fieldErrors.excerpt))}
              rows={2}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <FieldError message={fieldErrors.excerpt} />
              <span className={cn(fieldErrors.excerpt && "text-destructive")}>{excerpt.length}/{EXCERPT_MAX_LENGTH}</span>
            </div>
          </Field>
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
  const suggestSlug = useSuggestWisdomSlug();
  const createDraft = useCreateWisdomTranslationDraft();
  const [title, setTitle] = useState(currentRow.title);
  const [slug, setSlug] = useState(currentRow.slug);
  const [entryType, setEntryType] = useState(currentRow.entryType);
  const [sourceCode, setSourceCode] = useState(currentRow.sourceCode ?? "");
  const [sourceUrl, setSourceUrl] = useState(currentRow.sourceUrl ?? "");
  const [sourceFamily, setSourceFamily] = useState(currentRow.sourceFamily ?? "");
  const [excerpt, setExcerpt] = useState(currentRow.excerpt ?? "");
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
    setExcerpt(currentRow.excerpt ?? "");
    setOriginalText(currentRow.originalText ?? "");
    setTranslatedText(currentRow.translatedText ?? "");
    setFieldErrors({});
  }, [currentRow, open]);

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (excerpt.trim().length > EXCERPT_MAX_LENGTH) nextErrors.excerpt = "Tóm tắt tối đa 500 ký tự.";
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
        excerpt: excerpt.trim() || undefined,
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
            <div className="flex gap-2">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="duong-dan-bai-viet" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={suggestSlug.isPending || !title.trim()}
                onClick={() =>
                  suggestSlug.mutate(
                    { title: title.trim(), sourceCode: sourceCode.trim() || undefined },
                    {
                      onSuccess: (res) => {
                        setSlug(res.slug);
                        toast.success("Đã gợi ý slug.");
                      },
                    },
                  )
                }
              >
                <SparklesIcon className="mr-1 size-4" />
                {suggestSlug.isPending ? "Đang gợi ý..." : "Gợi ý slug"}
              </Button>
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
          <Field label="Tóm tắt">
            <Textarea
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                if (fieldErrors.excerpt) setFieldErrors((prev) => ({ ...prev, excerpt: "" }));
              }}
              placeholder="Mô tả ngắn..."
              maxLength={EXCERPT_MAX_LENGTH}
              className={invalidFieldClass(Boolean(fieldErrors.excerpt))}
              rows={2}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <FieldError message={fieldErrors.excerpt} />
              <span className={cn(fieldErrors.excerpt && "text-destructive")}>{excerpt.length}/{EXCERPT_MAX_LENGTH}</span>
            </div>
          </Field>
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
  const navigateTo = useNavigateTo();

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
          <span className="text-sm text-muted-foreground">{entryTypeLabel(row.original.entryType)}</span>
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
      <div className="flex items-center justify-between gap-2">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Lọc bài Bạch thoại..."
          viewButtonLabel="Xem"
          filters={[
            { columnId: "entryType", title: "Loại bài", options: entryTypeOptions },
            { columnId: "status", title: "Trạng thái", options: statusOptions },
          ]}
        />
        <Button size="sm" onClick={() => navigateTo("/noi-dung/bach-thoai/tao-moi")}>
          <BookOpenIcon className="mr-2 size-4" />
          Thêm bài
        </Button>
      </div>
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
  const { data: entryEnvelope, isLoading: isEntryLoading } = useQuery(wisdomEntryListOptions({ limit: 100 }));
  const { data: authorityEnvelope, isLoading: isAuthorityLoading } = useQuery(
    authorityProfileListOptions({ limit: 20, isActive: true }),
  );
  const navigateTo = useNavigateTo();
  const entries = entryEnvelope?.data ?? [];
  const authorityProfiles = authorityEnvelope?.data ?? [];

  return (
    <WisdomProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bạch thoại Phật pháp</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Quản trị kho video Bạch thoại, Khai thị, Phật ngôn và Bài pháp hội theo nguồn YouTube hoặc nguồn chính thức. Hỏi đáp là nhóm nội dung riêng, không nhập chung vào lane này.
            </p>
          </div>
          <Button onClick={() => navigateTo("/noi-dung/bach-thoai/tao-moi")}>
            <BookOpenIcon className="mr-2 size-4" />
            Thêm bài
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {isEntryLoading ? (
              <Card>
                <CardContent className="px-4 py-10 text-sm text-muted-foreground">Đang tải thư viện video Bạch thoại...</CardContent>
              </Card>
            ) : (
              <WisdomVideoDeck entries={entries} />
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Bảng quản trị bài Bạch thoại</CardTitle>
                <CardDescription>
                  Vẫn giữ bảng vận hành để lọc, xuất bản và chỉnh sửa; nhưng phần trên luôn phản ánh đúng logic video trước, văn bản sau của Bạch thoại.
                </CardDescription>
              </CardHeader>
            </Card>
            <WisdomTable />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quy tắc phân luồng</CardTitle>
                <CardDescription>
                  Hỏi đáp không được nhập ở workspace này và không được dùng copy hoặc route thay cho Bạch thoại Phật pháp.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                <div className="rounded-lg border px-3 py-2">Bạch thoại ưu tiên video, nguồn phát và dấu vết nguồn để người duyệt đối chiếu nhanh.</div>
                <div className="rounded-lg border px-3 py-2">Hỏi đáp đi nhóm nội dung riêng, không dùng cùng UX với kho video Bạch thoại.</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hồ sơ nguồn đáng tin</CardTitle>
                <CardDescription>Hồ sơ nguồn đang hoạt động để gắn provenance cho bài nhạy cảm hoặc cần đối chiếu kỹ.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {isAuthorityLoading ? (
                  <div className="text-sm text-muted-foreground">Đang tải hồ sơ nguồn...</div>
                ) : authorityProfiles.length ? (
                  authorityProfiles.slice(0, 6).map((profile) => (
                    <div key={profile.publicId} className="rounded-lg border px-3 py-3 text-sm text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{profile.name}</span>
                        {profile.title ? <Badge variant="outline">{profile.title}</Badge> : null}
                      </div>
                      {profile.description ? <p className="mt-2 line-clamp-3">{profile.description}</p> : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed px-3 py-8 text-sm text-muted-foreground">Chưa có hồ sơ nguồn nào.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <WisdomDialogs />
    </WisdomProvider>
  );
}
