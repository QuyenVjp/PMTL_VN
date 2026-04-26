import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2Icon, LoaderCircleIcon, SparklesIcon, XCircleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminDetailField,
  AdminDetailPage,
  AdminDetailSection,
  AdminFormField,
  WorkspaceConfirmDialog,
  WorkspaceDetailSkeleton,
} from "@/components/workspace";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { useSlugField, type SlugStatus } from "@/lib/hooks/use-slug-field";
import { useCreateWisdomTranslationDraft, useDeleteWisdomEntry, usePublishWisdomEntry, useUpdateWisdomEntry } from "./mutations";
import { wisdomEntryDetailOptions } from "./queries";

const ENTRY_TYPE_OPTIONS = [
  { label: "Bạch thoại Phật pháp", value: "BACH_THOAI" },
  { label: "Khai thị", value: "KHAI_THI" },
  { label: "Phật ngôn Phật ngữ", value: "PHAT_NGON" },
  { label: "Bài pháp hội", value: "PHAP_HOI" },
] as const;

const wisdomDetailSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  slug: z.string().trim().optional(),
  entryType: z.enum(["BACH_THOAI", "KHAI_THI", "PHAT_NGON", "PHAP_HOI"]),
  sourceCode: z.string().trim().optional(),
  sourceUrl: z.string().trim().optional(),
  sourceFamily: z.string().trim().optional(),
  originalText: z.string().trim().optional(),
  translatedText: z.string().trim().optional(),
});

function SlugStatusIcon({ status }: { status: SlugStatus }) {
  if (status === "checking") return <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />;
  if (status === "available") return <CheckCircle2Icon className="size-4 text-emerald-500" />;
  if (status === "taken") return <XCircleIcon className="size-4 text-destructive" />;
  return null;
}

function statusBadgeClass(status: string): string {
  if (status === "PUBLISHED") return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "DRAFT") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400";
}

function statusLabel(status: string): string {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "DRAFT") return "Nháp";
  if (status === "ARCHIVED") return "Đã ẩn";
  return status;
}

export function WisdomDetailPage() {
  const navigate = useNavigate();
  const rawParams: unknown = useParams({ strict: false });
  const publicId = typeof rawParams === "object" && rawParams !== null && typeof (rawParams as Record<string, unknown>).publicId === "string"
    ? (rawParams as Record<string, string>).publicId
    : "";
  const { data: entry, isLoading, isError } = useQuery(wisdomEntryDetailOptions(publicId ?? ""));
  const updateEntry = useUpdateWisdomEntry();
  const publishEntry = usePublishWisdomEntry();
  const deleteEntry = useDeleteWisdomEntry();
  const createDraft = useCreateWisdomTranslationDraft();

  const form = useAdminZodForm(wisdomDetailSchema, {
    defaultValues: {
      title: "",
      slug: "",
      entryType: "BACH_THOAI",
      sourceCode: "",
      sourceUrl: "",
      sourceFamily: "",
      originalText: "",
      translatedText: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const { slug, setSlug, setSlugFromServer, slugStatus } = useSlugField({
    title: values.title,
    entityType: "WISDOM",
    excludePublicId: entry?.publicId,
    initialSlug: entry?.slug,
  });
  const lastSlugRef = useRef(slug);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (lastSlugRef.current !== slug) {
      lastSlugRef.current = slug;
      form.setValue("slug", slug, { shouldValidate: false });
      form.clearErrors("slug");
    }
  }, [form, slug]);

  useEffect(() => {
    if (!entry) return;
    form.reset({
      title: entry.title,
      slug: entry.slug,
      entryType: entry.entryType,
      sourceCode: entry.sourceCode ?? "",
      sourceUrl: entry.sourceUrl ?? "",
      sourceFamily: entry.sourceFamily ?? "",
      originalText: entry.originalText ?? "",
      translatedText: entry.translatedText ?? "",
    });
    setSlugFromServer(entry.slug, entry.title);
  }, [entry, form, setSlugFromServer]);

  const handleSave = form.handleSubmit((formValues) => {
    const entryKey = entry?.publicId ?? publicId ?? "";
    if (!entryKey) {
      toast.error("Không xác định được mã bài Bạch thoại.");
      return;
    }

    if (slugStatus === "taken") {
      form.setError("slug", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." }, { shouldFocus: true });
      return;
    }

    updateEntry.mutate(
      {
        publicId: entryKey,
        title: formValues.title,
        slug: slug.trim() || undefined,
        entryType: formValues.entryType,
        sourceCode: formValues.sourceCode || undefined,
        sourceUrl: formValues.sourceUrl || undefined,
        sourceFamily: formValues.sourceFamily || undefined,
        originalText: formValues.originalText || undefined,
        translatedText: formValues.translatedText || undefined,
      },
      {
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  if (isLoading) {
    return <WorkspaceDetailSkeleton />;
  }

  if (isError || !entry) {
    return <div className="flex min-h-[240px] items-center justify-center text-sm text-destructive">Không thể tải bài Bạch thoại. Vui lòng thử lại.</div>;
  }

  const actions = [
    ...(entry.status !== "PUBLISHED" ? [{ label: "Xuất bản", onClick: () => setConfirmPublish(true) }] : []),
    {
      label: "Xoá bài Bạch thoại",
      onClick: () => setConfirmDelete(true),
      variant: "destructive" as const,
      separator: true,
    },
  ];

  return (
    <>
      <AdminDetailPage
        backHref="/noi-dung/bach-thoai"
        backLabel="Bạch thoại Phật pháp"
        title={entry.title}
        status={<Badge variant="outline" className={statusBadgeClass(entry.status)}>{statusLabel(entry.status)}</Badge>}
        onSave={() => {
          void handleSave();
        }}
        isSaving={updateEntry.isPending}
        saveLabel="Lưu"
        saveDisabled={!values.title.trim() || slugStatus === "taken"}
        actions={actions}
        sidebar={
          <>
            <AdminDetailSection title="Thông tin">
              <AdminDetailField label="Trạng thái" value={<Badge variant="outline" className={statusBadgeClass(entry.status)}>{statusLabel(entry.status)}</Badge>} />
              <AdminDetailField label="Xuất bản lúc" value={entry.publishedAt ? new Date(entry.publishedAt).toLocaleString("vi-VN") : null} />
              <AdminDetailField label="Tạo lúc" value={new Date(entry.createdAt).toLocaleString("vi-VN")} />
              <AdminDetailField label="Cập nhật lúc" value={new Date(entry.updatedAt).toLocaleString("vi-VN")} />
            </AdminDetailSection>
            <AdminDetailSection title="Nguồn">
              <AdminDetailField label="Mã nguồn" value={entry.sourceCode} />
              <AdminDetailField label="Nguồn gốc" value={entry.sourceFamily} />
            </AdminDetailSection>
          </>
        }
      >
        <AdminDetailSection title="Thông tin cơ bản">
          <div className="flex flex-col gap-4">
            <FieldError message={errors.root?.server?.message} />
            <AdminFormField label="Tiêu đề *" invalid={Boolean(errors.title)}>
              <Input
                {...form.register("title")}
                aria-invalid={Boolean(errors.title)}
                className={invalidFieldClass(Boolean(errors.title))}
              />
              <FieldError message={errors.title?.message} />
            </AdminFormField>

            <div className="grid items-start gap-4 md:grid-cols-2">
              <AdminFormField label="Slug" invalid={slugStatus === "taken" || Boolean(errors.slug)}>
                <div className="relative">
                  <Input
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      form.clearErrors("slug");
                      form.setValue("slug", event.target.value, { shouldDirty: true });
                      setSlug(event.target.value);
                    }}
                    aria-invalid={slugStatus === "taken" || Boolean(errors.slug)}
                    className={invalidFieldClass(slugStatus === "taken" || Boolean(errors.slug))}
                    style={{ paddingRight: slugStatus !== "idle" ? "2.25rem" : undefined }}
                  />
                  {(slugStatus !== "idle" || errors.slug) && (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <SlugStatusIcon status={errors.slug ? "taken" : slugStatus} />
                    </span>
                  )}
                </div>
                <FieldError message={errors.slug?.message ?? (slugStatus === "taken" ? "Slug này đã được dùng, hãy chỉnh lại." : undefined)} />
              </AdminFormField>

              <AdminFormField label="Loại bài">
                <Select value={values.entryType} onValueChange={(value) => form.setValue("entryType", value as typeof values.entryType, { shouldDirty: true, shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENTRY_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </AdminFormField>
            </div>

            <div className="grid items-start gap-4 md:grid-cols-2">
              <AdminFormField label="Mã nguồn" invalid={Boolean(errors.sourceCode)}>
                <Input
                  {...form.register("sourceCode")}
                  placeholder="VD: shuohua20140808"
                  aria-invalid={Boolean(errors.sourceCode)}
                  className={invalidFieldClass(Boolean(errors.sourceCode))}
                />
                <FieldError message={errors.sourceCode?.message} />
              </AdminFormField>
              <AdminFormField label="Nguồn gốc" invalid={Boolean(errors.sourceFamily)}>
                <Input
                  {...form.register("sourceFamily")}
                  placeholder="VD: community_translation"
                  aria-invalid={Boolean(errors.sourceFamily)}
                  className={invalidFieldClass(Boolean(errors.sourceFamily))}
                />
                <FieldError message={errors.sourceFamily?.message} />
              </AdminFormField>
            </div>
          </div>
        </AdminDetailSection>

        <AdminDetailSection title="Nguồn phát">
          <AdminFormField label="URL nguồn video" hint="Dán link YouTube hoặc link nguồn chính thức." invalid={Boolean(errors.sourceUrl)}>
            <Input
              {...form.register("sourceUrl")}
              placeholder="https://www.youtube.com/watch?v=..."
              aria-invalid={Boolean(errors.sourceUrl)}
              className={invalidFieldClass(Boolean(errors.sourceUrl))}
            />
            <FieldError message={errors.sourceUrl?.message} />
          </AdminFormField>
        </AdminDetailSection>

        <AdminDetailSection title="Nguyên văn và bản dịch">
          <div className="flex flex-col gap-4">
            <AdminFormField label="Nguyên văn gốc" invalid={Boolean(errors.originalText)}>
              <Textarea
                {...form.register("originalText")}
                rows={10}
                placeholder="Văn bản gốc..."
                aria-invalid={Boolean(errors.originalText)}
                className={invalidFieldClass(Boolean(errors.originalText))}
              />
              <FieldError message={errors.originalText?.message} />
            </AdminFormField>

            <AdminFormField label="Bản dịch tiếng Việt" invalid={Boolean(errors.translatedText)}>
              <Textarea
                {...form.register("translatedText")}
                rows={10}
                placeholder="Bản dịch tiếng Việt..."
                aria-invalid={Boolean(errors.translatedText)}
                className={invalidFieldClass(Boolean(errors.translatedText))}
              />
              <FieldError message={errors.translatedText?.message} />
            </AdminFormField>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={createDraft.isPending || !(values.originalText ?? "").trim()}
                onClick={() => createDraft.mutate(
                  {
                    originalText: (values.originalText ?? "").trim(),
                    title: values.title.trim() || undefined,
                    sourceCode: (values.sourceCode ?? "").trim() || undefined,
                  },
                  { onSuccess: (result) => form.setValue("translatedText", result.translatedText, { shouldDirty: true, shouldValidate: true }) },
                )}
              >
                <SparklesIcon className="mr-2 size-4" />
                {createDraft.isPending ? "Đang dịch..." : "Tạo bản dịch nháp"}
              </Button>
            </div>
          </div>
        </AdminDetailSection>
      </AdminDetailPage>

      <WorkspaceConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title="Xuất bản bài Bạch thoại"
        description={<>Xuất bản <span className="font-semibold text-foreground">{entry.title}</span>? Bài sẽ hiển thị công khai ngay lập tức.</>}
        confirmLabel="Xuất bản"
        isPending={publishEntry.isPending}
        onConfirm={() => publishEntry.mutate(entry.publicId, { onSuccess: () => setConfirmPublish(false) })}
      />
      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá bài Bạch thoại"
        description={<>Xoá <span className="font-semibold text-foreground">{entry.title}</span>? Thao tác này không thể hoàn tác.</>}
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteEntry.isPending}
        onConfirm={() => deleteEntry.mutate(entry.publicId, { onSuccess: () => void navigate({ to: "/noi-dung/bach-thoai" }) })}
      />
    </>
  );
}
