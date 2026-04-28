import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

import { AdminDetailField, AdminDetailPage, AdminDetailSection, AdminFormField, WorkspaceConfirmDialog, WorkspaceDetailSkeleton } from "@/components/workspace";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { readRouteParam, useNavigateTo } from "@/lib/router-utils";
import {
  useCreateLifeReleaseFaq,
  useCreateLifeReleaseGuide,
  useCreateLifeReleaseVariant,
  useDeleteLifeReleaseFaq,
  useDeleteLifeReleaseGuide,
  useDeleteLifeReleaseVariant,
  useUpdateLifeReleaseFaq,
  useUpdateLifeReleaseGuide,
  useUpdateLifeReleaseVariant,
} from "./mutations.js";
import { lifeReleaseOverviewOptions, type LifeReleaseGuide, type LifeReleaseGuideGroup, type LifeReleaseVariant, type LifeReleaseFaq } from "./queries.js";

const guideGroupLabels: Record<LifeReleaseGuideGroup, string> = {
  NGHI_THUC: "Nghi thức",
  LUU_Y_CHUAN_BI: "Lưu ý và chuẩn bị",
  HOI_DAP: "Hỏi đáp",
};

const guideSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  slug: z.string().trim().optional(),
  summary: z.string().trim().min(1, "Tóm tắt không được để trống."),
  groupKey: z.enum(["NGHI_THUC", "LUU_Y_CHUAN_BI", "HOI_DAP"]),
  sourceReference: z.string().trim().min(1, "Nguồn tham chiếu không được để trống."),
  reviewNote: z.string().trim().min(1, "Ghi chú biên tập không được để trống."),
  warningText: z.string().trim().optional(),
  displayOrder: z.number().int().min(0, "Thứ tự phải từ 0 trở lên."),
});

const variantSchema = z.object({
  name: z.string().trim().min(1, "Tên biến thể không được để trống."),
  routeSlug: z.string().trim().min(1, "Route slug không được để trống."),
  summary: z.string().trim().min(1, "Tóm tắt không được để trống."),
  sourceReference: z.string().trim().min(1, "Nguồn tham chiếu không được để trống."),
  reviewNote: z.string().trim().min(1, "Ghi chú biên tập không được để trống."),
  warningText: z.string().trim().optional(),
  displayOrder: z.number().int().min(0, "Thứ tự phải từ 0 trở lên."),
});

const faqSchema = z.object({
  question: z.string().trim().min(1, "Câu hỏi không được để trống."),
  answer: z.string().trim().min(1, "Câu trả lời không được để trống."),
  sourceReference: z.string().trim().min(1, "Nguồn tham chiếu không được để trống."),
  displayOrder: z.number().int().min(0, "Thứ tự phải từ 0 trở lên."),
});

type GuideFormValues = z.infer<typeof guideSchema>;
type VariantFormValues = z.infer<typeof variantSchema>;
type FaqFormValues = z.infer<typeof faqSchema>;

function linesToWarnings(value?: string) {
  return (value ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
}

function guideDefaults(guide?: LifeReleaseGuide): GuideFormValues {
  return {
    title: guide?.title ?? "",
    slug: guide?.slug ?? "",
    summary: guide?.summary ?? "",
    groupKey: guide?.groupKey ?? "NGHI_THUC",
    sourceReference: guide?.sourceReference ?? "",
    reviewNote: guide?.reviewNote ?? "",
    warningText: guide?.warningNotes.join("\n") ?? "",
    displayOrder: guide?.displayOrder ?? 0,
  };
}

function variantDefaults(variant?: LifeReleaseVariant): VariantFormValues {
  return {
    name: variant?.name ?? "",
    routeSlug: variant?.routeSlug ?? "",
    summary: variant?.summary ?? "",
    sourceReference: variant?.sourceReference ?? "",
    reviewNote: variant?.reviewNote ?? "",
    warningText: variant?.warningNotes.join("\n") ?? "",
    displayOrder: variant?.displayOrder ?? 0,
  };
}

function faqDefaults(faq?: LifeReleaseFaq): FaqFormValues {
  return {
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    sourceReference: faq?.sourceReference ?? "",
    displayOrder: faq?.displayOrder ?? 0,
  };
}

function GuideForm({ form }: { form: UseFormReturn<GuideFormValues> }) {
  const { errors } = form.formState;
  const values = form.watch();
  return (
    <AdminDetailSection title="Bài hướng dẫn Phóng sanh">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Tiêu đề *">
          <Input {...form.register("title")} className={invalidFieldClass(Boolean(errors.title))} />
          <FieldError message={errors.title?.message} />
        </AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Slug">
            <Input {...form.register("slug")} placeholder="tu-dong-tao-neu-de-trong" />
          </AdminFormField>
          <AdminFormField label="Nhóm">
            <Select value={values.groupKey} onValueChange={(value) => form.setValue("groupKey", value as LifeReleaseGuideGroup, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(guideGroupLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </AdminFormField>
        </div>
        <AdminFormField label="Tóm tắt *">
          <Textarea {...form.register("summary")} rows={4} className={invalidFieldClass(Boolean(errors.summary))} />
          <FieldError message={errors.summary?.message} />
        </AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Nguồn tham chiếu *">
            <Input {...form.register("sourceReference")} className={invalidFieldClass(Boolean(errors.sourceReference))} />
            <FieldError message={errors.sourceReference?.message} />
          </AdminFormField>
          <AdminFormField label="Thứ tự">
            <Input type="number" {...form.register("displayOrder", { valueAsNumber: true })} />
            <FieldError message={errors.displayOrder?.message} />
          </AdminFormField>
        </div>
        <AdminFormField label="Ghi chú biên tập *">
          <Textarea {...form.register("reviewNote")} rows={3} className={invalidFieldClass(Boolean(errors.reviewNote))} />
          <FieldError message={errors.reviewNote?.message} />
        </AdminFormField>
        <AdminFormField label="Cảnh báo / lưu ý">
          <Textarea {...form.register("warningText")} rows={5} placeholder="Mỗi dòng một lưu ý" />
        </AdminFormField>
      </div>
    </AdminDetailSection>
  );
}

function GuideSidebar({ guide, values }: { guide?: LifeReleaseGuide; values: GuideFormValues }) {
  return (
    <>
      <AdminDetailSection title="Thông tin">
        <AdminDetailField label="Nhóm" value={guideGroupLabels[values.groupKey]} />
        <AdminDetailField label="Slug" value={values.slug || "Tự tạo khi lưu"} />
        <AdminDetailField label="Thứ tự" value={String(values.displayOrder)} />
        <AdminDetailField label="Số cảnh báo" value={String(linesToWarnings(values.warningText).length)} />
      </AdminDetailSection>
      {guide ? (
        <AdminDetailSection title="Lịch sử">
          <AdminDetailField label="Cập nhật" value={new Date(guide.updatedAt).toLocaleString("vi-VN")} />
        </AdminDetailSection>
      ) : null}
    </>
  );
}

function VariantForm({ form }: { form: UseFormReturn<VariantFormValues> }) {
  const { errors } = form.formState;
  return (
    <AdminDetailSection title="Biến thể nghi thức">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Tên biến thể *">
          <Input {...form.register("name")} className={invalidFieldClass(Boolean(errors.name))} />
          <FieldError message={errors.name?.message} />
        </AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Route slug *">
            <Input {...form.register("routeSlug")} className={invalidFieldClass(Boolean(errors.routeSlug))} />
            <FieldError message={errors.routeSlug?.message} />
          </AdminFormField>
          <AdminFormField label="Thứ tự">
            <Input type="number" {...form.register("displayOrder", { valueAsNumber: true })} />
            <FieldError message={errors.displayOrder?.message} />
          </AdminFormField>
        </div>
        <AdminFormField label="Tóm tắt *">
          <Textarea {...form.register("summary")} rows={4} className={invalidFieldClass(Boolean(errors.summary))} />
          <FieldError message={errors.summary?.message} />
        </AdminFormField>
        <AdminFormField label="Nguồn tham chiếu *">
          <Input {...form.register("sourceReference")} className={invalidFieldClass(Boolean(errors.sourceReference))} />
          <FieldError message={errors.sourceReference?.message} />
        </AdminFormField>
        <AdminFormField label="Ghi chú biên tập *">
          <Textarea {...form.register("reviewNote")} rows={3} className={invalidFieldClass(Boolean(errors.reviewNote))} />
          <FieldError message={errors.reviewNote?.message} />
        </AdminFormField>
        <AdminFormField label="Cảnh báo / lưu ý">
          <Textarea {...form.register("warningText")} rows={5} placeholder="Mỗi dòng một lưu ý" />
        </AdminFormField>
      </div>
    </AdminDetailSection>
  );
}

function VariantSidebar({ variant, values }: { variant?: LifeReleaseVariant; values: VariantFormValues }) {
  return (
    <>
      <AdminDetailSection title="Thông tin">
        <AdminDetailField label="Route slug" value={values.routeSlug || "Chưa nhập"} />
        <AdminDetailField label="Thứ tự" value={String(values.displayOrder)} />
        <AdminDetailField label="Số cảnh báo" value={String(linesToWarnings(values.warningText).length)} />
      </AdminDetailSection>
      {variant ? (
        <AdminDetailSection title="Lịch sử">
          <AdminDetailField label="Cập nhật" value={new Date(variant.updatedAt).toLocaleString("vi-VN")} />
        </AdminDetailSection>
      ) : null}
    </>
  );
}

function FaqForm({ form }: { form: UseFormReturn<FaqFormValues> }) {
  const { errors } = form.formState;
  return (
    <AdminDetailSection title="Hỏi đáp Phóng sanh">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Câu hỏi *">
          <Input {...form.register("question")} className={invalidFieldClass(Boolean(errors.question))} />
          <FieldError message={errors.question?.message} />
        </AdminFormField>
        <AdminFormField label="Câu trả lời *">
          <Textarea {...form.register("answer")} rows={10} className={invalidFieldClass(Boolean(errors.answer))} />
          <FieldError message={errors.answer?.message} />
        </AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Nguồn tham chiếu *">
            <Input {...form.register("sourceReference")} className={invalidFieldClass(Boolean(errors.sourceReference))} />
            <FieldError message={errors.sourceReference?.message} />
          </AdminFormField>
          <AdminFormField label="Thứ tự">
            <Input type="number" {...form.register("displayOrder", { valueAsNumber: true })} />
            <FieldError message={errors.displayOrder?.message} />
          </AdminFormField>
        </div>
      </div>
    </AdminDetailSection>
  );
}

function FaqSidebar({ faq, values }: { faq?: LifeReleaseFaq; values: FaqFormValues }) {
  return (
    <AdminDetailSection title="Thông tin">
      <AdminDetailField label="Nguồn" value={values.sourceReference || "Chưa nhập"} />
      <AdminDetailField label="Thứ tự" value={String(values.displayOrder)} />
      {faq ? <AdminDetailField label="Cập nhật" value={new Date(faq.updatedAt).toLocaleString("vi-VN")} /> : null}
    </AdminDetailSection>
  );
}

export function LifeReleaseGuideCreatePage() {
  const navigateTo = useNavigateTo();
  const createGuide = useCreateLifeReleaseGuide();
  const form = useAdminZodForm(guideSchema, { defaultValues: guideDefaults() });
  const values = form.watch();
  const handleSave = form.handleSubmit((formValues) => {
    createGuide.mutate(
      { ...formValues, slug: formValues.slug || undefined, warningNotes: linesToWarnings(formValues.warningText) },
      { onSuccess: () => navigateTo("/noi-dung/phong-sanh"), onError: (error) => applyApiFieldErrors(form, error) },
    );
  });

  return (
    <AdminDetailPage
      backHref="/noi-dung/phong-sanh"
      backLabel="Phóng sanh"
      title="Thêm bài hướng dẫn"
      onSave={() => void handleSave()}
      isSaving={createGuide.isPending}
      saveLabel="Tạo mới"
      saveDisabled={!values.title.trim() || !values.summary.trim() || !values.sourceReference.trim() || !values.reviewNote.trim()}
      sidebar={<GuideSidebar values={values} />}
    >
      <GuideForm form={form} />
    </AdminDetailPage>
  );
}

export function LifeReleaseGuideDetailPage() {
  const params = useParams({ strict: false });
  const publicId = readRouteParam(params, "guidePublicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: overview, isLoading } = useQuery(lifeReleaseOverviewOptions());
  const guide = overview?.guides.find((item) => item.publicId === publicId);
  const updateGuide = useUpdateLifeReleaseGuide();
  const deleteGuide = useDeleteLifeReleaseGuide();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useAdminZodForm(guideSchema, { defaultValues: guideDefaults(guide) });
  const values = form.watch();

  useEffect(() => {
    if (guide) form.reset(guideDefaults(guide));
  }, [form, guide]);

  const handleSave = form.handleSubmit((formValues) => {
    updateGuide.mutate(
      { publicId, ...formValues, slug: formValues.slug || undefined, warningNotes: linesToWarnings(formValues.warningText) },
      { onError: (error) => applyApiFieldErrors(form, error) },
    );
  });

  if (isLoading) return <WorkspaceDetailSkeleton />;

  return (
    <>
      <AdminDetailPage
        backHref="/noi-dung/phong-sanh"
        backLabel="Phóng sanh"
        title={guide?.title ?? "Không tìm thấy bài hướng dẫn"}
        onSave={() => void handleSave()}
        isSaving={updateGuide.isPending}
        saveDisabled={!guide || !values.title.trim() || !values.summary.trim() || !values.sourceReference.trim() || !values.reviewNote.trim()}
        actions={guide ? [{ label: "Xoá bài hướng dẫn", variant: "destructive", onClick: () => setDeleteOpen(true) }] : []}
        sidebar={<GuideSidebar guide={guide} values={values} />}
      >
        {guide ? <GuideForm form={form} /> : <AdminDetailSection title="Không có dữ liệu"><p className="text-sm text-muted-foreground">Bản ghi này không tồn tại hoặc đã bị xoá.</p></AdminDetailSection>}
      </AdminDetailPage>
      <WorkspaceConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá bài hướng dẫn Phóng sanh"
        description="Bản ghi này sẽ bị xoá khỏi workspace nội dung Phóng sanh."
        confirmLabel="Xoá"
        isPending={deleteGuide.isPending}
        onConfirm={() => deleteGuide.mutate(publicId, { onSuccess: () => navigateTo("/noi-dung/phong-sanh") })}
      />
    </>
  );
}

export function LifeReleaseVariantCreatePage() {
  const navigateTo = useNavigateTo();
  const createVariant = useCreateLifeReleaseVariant();
  const form = useAdminZodForm(variantSchema, { defaultValues: variantDefaults() });
  const values = form.watch();
  const handleSave = form.handleSubmit((formValues) => {
    createVariant.mutate(
      { ...formValues, warningNotes: linesToWarnings(formValues.warningText) },
      { onSuccess: () => navigateTo("/noi-dung/phong-sanh"), onError: (error) => applyApiFieldErrors(form, error) },
    );
  });

  return (
    <AdminDetailPage
      backHref="/noi-dung/phong-sanh"
      backLabel="Phóng sanh"
      title="Thêm biến thể nghi thức"
      onSave={() => void handleSave()}
      isSaving={createVariant.isPending}
      saveLabel="Tạo mới"
      saveDisabled={!values.name.trim() || !values.routeSlug.trim() || !values.summary.trim() || !values.sourceReference.trim() || !values.reviewNote.trim()}
      sidebar={<VariantSidebar values={values} />}
    >
      <VariantForm form={form} />
    </AdminDetailPage>
  );
}

export function LifeReleaseVariantDetailPage() {
  const params = useParams({ strict: false });
  const publicId = readRouteParam(params, "variantPublicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: overview, isLoading } = useQuery(lifeReleaseOverviewOptions());
  const variant = overview?.ritualVariants.find((item) => item.publicId === publicId);
  const updateVariant = useUpdateLifeReleaseVariant();
  const deleteVariant = useDeleteLifeReleaseVariant();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useAdminZodForm(variantSchema, { defaultValues: variantDefaults(variant) });
  const values = form.watch();

  useEffect(() => {
    if (variant) form.reset(variantDefaults(variant));
  }, [form, variant]);

  const handleSave = form.handleSubmit((formValues) => {
    updateVariant.mutate(
      { publicId, ...formValues, warningNotes: linesToWarnings(formValues.warningText) },
      { onError: (error) => applyApiFieldErrors(form, error) },
    );
  });

  if (isLoading) return <WorkspaceDetailSkeleton />;

  return (
    <>
      <AdminDetailPage
        backHref="/noi-dung/phong-sanh"
        backLabel="Phóng sanh"
        title={variant?.name ?? "Không tìm thấy biến thể"}
        onSave={() => void handleSave()}
        isSaving={updateVariant.isPending}
        saveDisabled={!variant || !values.name.trim() || !values.routeSlug.trim() || !values.summary.trim() || !values.sourceReference.trim() || !values.reviewNote.trim()}
        actions={variant ? [{ label: "Xoá biến thể", variant: "destructive", onClick: () => setDeleteOpen(true) }] : []}
        sidebar={<VariantSidebar variant={variant} values={values} />}
      >
        {variant ? <VariantForm form={form} /> : <AdminDetailSection title="Không có dữ liệu"><p className="text-sm text-muted-foreground">Bản ghi này không tồn tại hoặc đã bị xoá.</p></AdminDetailSection>}
      </AdminDetailPage>
      <WorkspaceConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá biến thể nghi thức"
        description="Biến thể này sẽ bị xoá khỏi workspace nội dung Phóng sanh."
        confirmLabel="Xoá"
        isPending={deleteVariant.isPending}
        onConfirm={() => deleteVariant.mutate(publicId, { onSuccess: () => navigateTo("/noi-dung/phong-sanh") })}
      />
    </>
  );
}

export function LifeReleaseFaqCreatePage() {
  const navigateTo = useNavigateTo();
  const createFaq = useCreateLifeReleaseFaq();
  const form = useAdminZodForm(faqSchema, { defaultValues: faqDefaults() });
  const values = form.watch();
  const handleSave = form.handleSubmit((formValues) => {
    createFaq.mutate(formValues, { onSuccess: () => navigateTo("/noi-dung/phong-sanh"), onError: (error) => applyApiFieldErrors(form, error) });
  });

  return (
    <AdminDetailPage
      backHref="/noi-dung/phong-sanh"
      backLabel="Phóng sanh"
      title="Thêm mục hỏi đáp"
      onSave={() => void handleSave()}
      isSaving={createFaq.isPending}
      saveLabel="Tạo mới"
      saveDisabled={!values.question.trim() || !values.answer.trim() || !values.sourceReference.trim()}
      sidebar={<FaqSidebar values={values} />}
    >
      <FaqForm form={form} />
    </AdminDetailPage>
  );
}

export function LifeReleaseFaqDetailPage() {
  const params = useParams({ strict: false });
  const publicId = readRouteParam(params, "faqPublicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: overview, isLoading } = useQuery(lifeReleaseOverviewOptions());
  const faq = overview?.faq.find((item) => item.publicId === publicId);
  const updateFaq = useUpdateLifeReleaseFaq();
  const deleteFaq = useDeleteLifeReleaseFaq();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useAdminZodForm(faqSchema, { defaultValues: faqDefaults(faq) });
  const values = form.watch();

  useEffect(() => {
    if (faq) form.reset(faqDefaults(faq));
  }, [faq, form]);

  const handleSave = form.handleSubmit((formValues) => {
    updateFaq.mutate({ publicId, ...formValues }, { onError: (error) => applyApiFieldErrors(form, error) });
  });

  if (isLoading) return <WorkspaceDetailSkeleton />;

  return (
    <>
      <AdminDetailPage
        backHref="/noi-dung/phong-sanh"
        backLabel="Phóng sanh"
        title={faq?.question ?? "Không tìm thấy mục hỏi đáp"}
        onSave={() => void handleSave()}
        isSaving={updateFaq.isPending}
        saveDisabled={!faq || !values.question.trim() || !values.answer.trim() || !values.sourceReference.trim()}
        actions={faq ? [{ label: "Xoá mục hỏi đáp", variant: "destructive", onClick: () => setDeleteOpen(true) }] : []}
        sidebar={<FaqSidebar faq={faq} values={values} />}
      >
        {faq ? <FaqForm form={form} /> : <AdminDetailSection title="Không có dữ liệu"><p className="text-sm text-muted-foreground">Bản ghi này không tồn tại hoặc đã bị xoá.</p></AdminDetailSection>}
      </AdminDetailPage>
      <WorkspaceConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá mục hỏi đáp Phóng sanh"
        description="Mục hỏi đáp này sẽ bị xoá khỏi workspace nội dung Phóng sanh."
        confirmLabel="Xoá"
        isPending={deleteFaq.isPending}
        onConfirm={() => deleteFaq.mutate(publicId, { onSuccess: () => navigateTo("/noi-dung/phong-sanh") })}
      />
    </>
  );
}
