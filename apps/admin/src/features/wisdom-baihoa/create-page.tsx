import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AlertCircleIcon, SparklesIcon, LoaderCircleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";

import { AdminDetailPage, AdminDetailSection, AdminFormField } from "@/components/workspace";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { useSlugField, type SlugStatus } from "@/lib/hooks/use-slug-field";
import { useCreateWisdomEntry, useCreateWisdomTranslationDraft } from "./mutations";

const ENTRY_TYPE_OPTIONS = [
  { label: "Bạch thoại Phật pháp", value: "BACH_THOAI" },
  { label: "Khai thị", value: "KHAI_THI" },
  { label: "Phật ngôn Phật ngữ", value: "PHAT_NGON" },
  { label: "Bài pháp hội", value: "PHAP_HOI" },
];

const wisdomCreateSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  entryType: z.enum(["BACH_THOAI", "KHAI_THI", "PHAT_NGON", "PHAP_HOI"]),
  sourceCode: z.string().trim().optional(),
  sourceUrl: z.string().trim().optional(),
  originalText: z.string().trim().optional(),
  translatedText: z.string().trim().optional(),
});

function getYouTubeId(url: string): string | null {
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

function SlugStatusIcon({ status }: { status: SlugStatus }) {
  if (status === "checking") {
    return <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />;
  }
  if (status === "available") {
    return <CheckCircle2Icon className="size-4 text-emerald-500" />;
  }
  if (status === "taken") {
    return <XCircleIcon className="size-4 text-destructive" />;
  }
  return null;
}

export function WisdomCreatePage() {
  const navigate = useNavigate();
  const createEntry = useCreateWisdomEntry();
  const createDraft = useCreateWisdomTranslationDraft();

  const form = useAdminZodForm(wisdomCreateSchema, {
    defaultValues: {
      title: "",
      entryType: "BACH_THOAI",
      sourceCode: "",
      sourceUrl: "",
      originalText: "",
      translatedText: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const { slug, setSlug, slugStatus } = useSlugField({ title: values.title, entityType: "WISDOM" });

  const sourceUrlValue = values.sourceUrl ?? "";
  const originalTextValue = values.originalText ?? "";
  const sourceCodeValue = values.sourceCode ?? "";
  const youtubeId = getYouTubeId(sourceUrlValue.trim());

  const handleSave = form.handleSubmit((formValues) => {
    if (slugStatus === "taken") {
      form.setError("root.server", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." });
      return;
    }

    createEntry.mutate(
      {
        title: formValues.title,
        slug: slug.trim() || undefined,
        entryType: formValues.entryType,
        sourceCode: formValues.sourceCode || undefined,
        sourceUrl: formValues.sourceUrl || undefined,
        originalText: formValues.originalText || undefined,
        translatedText: formValues.translatedText || undefined,
      },
      {
        onSuccess: () => {
          void navigate({ to: "/noi-dung/bach-thoai" });
        },
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  const sidebar = (
    <AdminDetailSection title="Ghi chú workspace">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-lg border px-3 py-2">`Bạch thoại Phật pháp` đi theo lane video / nguồn phát. Nếu có YouTube, ưu tiên điền `URL nguồn` để admin và web đều dựng đúng iframe.</div>
          <div className="rounded-lg border px-3 py-2">Hỏi đáp là nhóm nội dung riêng, không được tạo từ form này.</div>
          <div className="rounded-lg border px-3 py-2">Nếu wording nhạy cảm, phải giữ `sourceCode` hoặc `sourceUrl` để reviewer lần lại nguồn chính xác.</div>
        </div>
      </AdminDetailSection>
  );

  return (
    <AdminDetailPage
      backHref="/noi-dung/bach-thoai"
      backLabel="Bạch thoại Phật pháp"
      title="Tạo bài Bạch thoại"
      status={<Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">Nháp</Badge>}
      onSave={() => {
        void handleSave();
      }}
      isSaving={createEntry.isPending}
      saveLabel="Tạo"
      saveDisabled={!values.title.trim() || slugStatus === "taken"}
      sidebar={sidebar}
    >
      <AdminDetailSection title="Thông tin cơ bản">
        <div className="flex flex-col gap-4">
          {errors.root?.server?.message && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Không lưu được bài</AlertTitle>
              <AlertDescription>{errors.root.server.message}</AlertDescription>
            </Alert>
          )}
          <AdminFormField label="Tiêu đề" invalid={Boolean(errors.title)}>
            <Input
              {...form.register("title")}
              placeholder="Nhập tiêu đề..."
              aria-invalid={Boolean(errors.title)}
              className={invalidFieldClass(Boolean(errors.title))}
            />
            <FieldError message={errors.title?.message} />
          </AdminFormField>
          <div className="grid items-start gap-4 md:grid-cols-2">
            <AdminFormField
              label="Slug"
              hint={slugStatus === "taken" ? "Slug này đã được dùng" : slugStatus === "available" ? "Slug hợp lệ" : undefined}
              invalid={slugStatus === "taken"}
            >
              <div className="relative">
                <Input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="tu-dong-tao-tu-tieu-de"
                  aria-invalid={slugStatus === "taken"}
                  className={invalidFieldClass(slugStatus === "taken")}
                  style={{ paddingRight: slugStatus !== "idle" ? "2.25rem" : undefined }}
                />
                {slugStatus !== "idle" && (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <SlugStatusIcon status={slugStatus} />
                  </span>
                )}
              </div>
              <FieldError message={slugStatus === "taken" ? "Slug này đã được dùng, hãy chỉnh lại." : undefined} />
            </AdminFormField>
            <AdminFormField label="Loại bài" invalid={Boolean(errors.entryType)}>
              <Select value={values.entryType} onValueChange={(value) => form.setValue("entryType", value as typeof values.entryType, { shouldDirty: true, shouldValidate: true })}>
                <SelectTrigger aria-invalid={Boolean(errors.entryType)} className={invalidFieldClass(Boolean(errors.entryType))}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTRY_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError message={errors.entryType?.message} />
            </AdminFormField>
          </div>
          <AdminFormField label="Mã nguồn" invalid={Boolean(errors.sourceCode)}>
            <Input
              {...form.register("sourceCode")}
              placeholder="VD: shuohua20140808"
              aria-invalid={Boolean(errors.sourceCode)}
              className={invalidFieldClass(Boolean(errors.sourceCode))}
            />
            <FieldError message={errors.sourceCode?.message} />
          </AdminFormField>
        </div>
      </AdminDetailSection>

      <AdminDetailSection title="Nguồn phát">
        <div className="flex flex-col gap-4">
          <AdminFormField
            label="URL nguồn video"
            hint="Dán link YouTube hoặc link nguồn chính thức. Nếu là YouTube, hệ thống sẽ dựng preview iframe."
            invalid={Boolean(errors.sourceUrl)}
          >
            <Input
              {...form.register("sourceUrl")}
              placeholder="https://www.youtube.com/watch?v=..."
              aria-invalid={Boolean(errors.sourceUrl)}
              className={invalidFieldClass(Boolean(errors.sourceUrl))}
            />
            <FieldError message={errors.sourceUrl?.message} />
          </AdminFormField>

          {youtubeId ? (
            <div className="overflow-hidden rounded-xl border">
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                  title="Preview video Bạch thoại"
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="border-t px-4 py-3 text-xs text-muted-foreground">
                Preview video đã nhận diện từ URL nguồn. Web public có thể dựng player trực tiếp từ nguồn này.
              </div>
            </div>
          ) : sourceUrlValue.trim() ? (
            <div className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
              URL nguồn đã có nhưng chưa nhận diện được YouTube embed. Hệ thống sẽ giữ link nguồn để reviewer kiểm tra thủ công.
            </div>
          ) : null}
        </div>
      </AdminDetailSection>

      <AdminDetailSection title="Nguyên văn và bản dịch">
        <div className="flex flex-col gap-4">
          <AdminFormField label="Nguyên văn gốc" invalid={Boolean(errors.originalText)}>
            <Textarea
              {...form.register("originalText")}
              rows={8}
              placeholder="Văn bản gốc..."
              aria-invalid={Boolean(errors.originalText)}
              className={invalidFieldClass(Boolean(errors.originalText))}
            />
            <FieldError message={errors.originalText?.message} />
          </AdminFormField>
          <AdminFormField label="Bản dịch tiếng Việt" invalid={Boolean(errors.translatedText)}>
            <Textarea
              {...form.register("translatedText")}
              rows={8}
              placeholder="Bản dịch nháp..."
              aria-invalid={Boolean(errors.translatedText)}
              className={invalidFieldClass(Boolean(errors.translatedText))}
            />
            <FieldError message={errors.translatedText?.message} />
          </AdminFormField>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={createDraft.isPending || !originalTextValue.trim()}
              onClick={() => createDraft.mutate(
                {
                  originalText: originalTextValue.trim(),
                  title: values.title.trim() || undefined,
                  sourceCode: sourceCodeValue.trim() || undefined,
                },
                {
                  onSuccess: (result) => form.setValue("translatedText", result.translatedText, { shouldDirty: true, shouldValidate: true }),
                },
              )}
            >
              <SparklesIcon className="mr-2 size-4" />
              {createDraft.isPending ? "Đang dịch..." : "Tạo bản dịch nháp"}
            </Button>
          </div>
        </div>
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
