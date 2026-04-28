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
  useCreateLittleHouseCaseVariant,
  useCreateLittleHouseFaq,
  useCreateLittleHouseGuide,
  useDeleteLittleHouseCaseVariant,
  useDeleteLittleHouseFaq,
  useDeleteLittleHouseGuide,
  useUpdateLittleHouseCaseVariant,
  useUpdateLittleHouseFaq,
  useUpdateLittleHouseGuide,
} from "./mutations.js";
import { littleHouseOverviewOptions, type LittleHouseCaseVariant, type LittleHouseFaq, type LittleHouseGuide, type LittleHouseGuideGroup } from "./queries.js";

const groupLabels: Record<LittleHouseGuideGroup, string> = {
  BAT_DAU: "Bắt đầu",
  TRI_TUNG: "Trì tụng",
  DOT_HAU_XU_LY: "Đốt và hậu xử lý",
  TRA_CUU: "Tra cứu",
  THUC_HANH: "Thực hành",
};

const guideSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  slug: z.string().trim().optional(),
  summary: z.string().trim().min(1, "Tóm tắt không được để trống."),
  groupKey: z.enum(["BAT_DAU", "TRI_TUNG", "DOT_HAU_XU_LY", "TRA_CUU", "THUC_HANH"]),
  sourceReference: z.string().trim().min(1, "Nguồn tham chiếu không được để trống."),
  versionNote: z.string().trim().min(1, "Ghi chú phiên bản không được để trống."),
  warningText: z.string().trim().optional(),
  displayOrder: z.number().int().min(0, "Thứ tự phải từ 0 trở lên."),
});

const variantSchema = z.object({
  name: z.string().trim().min(1, "Tên biến thể không được để trống."),
  summary: z.string().trim().min(1, "Tóm tắt không được để trống."),
  relatedGroup: z.enum(["BAT_DAU", "TRI_TUNG", "DOT_HAU_XU_LY", "TRA_CUU", "THUC_HANH"]),
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

function warnings(value?: string) {
  return (value ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
}

function guideDefaults(guide?: LittleHouseGuide): GuideFormValues {
  return {
    title: guide?.title ?? "",
    slug: guide?.slug ?? "",
    summary: guide?.summary ?? "",
    groupKey: guide?.groupKey ?? "BAT_DAU",
    sourceReference: guide?.sourceReference ?? "",
    versionNote: guide?.versionNote ?? "",
    warningText: guide?.warningNotes.join("\n") ?? "",
    displayOrder: guide?.displayOrder ?? 0,
  };
}

function variantDefaults(variant?: LittleHouseCaseVariant): VariantFormValues {
  return {
    name: variant?.name ?? "",
    summary: variant?.summary ?? "",
    relatedGroup: variant?.relatedGroup ?? "BAT_DAU",
    sourceReference: variant?.sourceReference ?? "",
    reviewNote: variant?.reviewNote ?? "",
    warningText: variant?.warningNotes.join("\n") ?? "",
    displayOrder: variant?.displayOrder ?? 0,
  };
}

function faqDefaults(faq?: LittleHouseFaq): FaqFormValues {
  return {
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    sourceReference: faq?.sourceReference ?? "",
    displayOrder: faq?.displayOrder ?? 0,
  };
}

function GroupSelect({ value, onChange }: { value: LittleHouseGuideGroup; onChange: (value: LittleHouseGuideGroup) => void }) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as LittleHouseGuideGroup)}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {Object.entries(groupLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function GuideForm({ form }: { form: UseFormReturn<GuideFormValues> }) {
  const { errors } = form.formState;
  const values = form.watch();
  return (
    <AdminDetailSection title="Bài hướng dẫn Ngôi Nhà Nhỏ">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Tiêu đề *"><Input {...form.register("title")} className={invalidFieldClass(Boolean(errors.title))} /><FieldError message={errors.title?.message} /></AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Slug"><Input {...form.register("slug")} placeholder="tu-dong-tao-neu-de-trong" /></AdminFormField>
          <AdminFormField label="Nhóm"><GroupSelect value={values.groupKey} onChange={(value) => form.setValue("groupKey", value, { shouldDirty: true, shouldValidate: true })} /></AdminFormField>
        </div>
        <AdminFormField label="Tóm tắt *"><Textarea {...form.register("summary")} rows={4} className={invalidFieldClass(Boolean(errors.summary))} /><FieldError message={errors.summary?.message} /></AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Nguồn tham chiếu *"><Input {...form.register("sourceReference")} className={invalidFieldClass(Boolean(errors.sourceReference))} /><FieldError message={errors.sourceReference?.message} /></AdminFormField>
          <AdminFormField label="Thứ tự"><Input type="number" {...form.register("displayOrder", { valueAsNumber: true })} /><FieldError message={errors.displayOrder?.message} /></AdminFormField>
        </div>
        <AdminFormField label="Ghi chú phiên bản *"><Textarea {...form.register("versionNote")} rows={3} className={invalidFieldClass(Boolean(errors.versionNote))} /><FieldError message={errors.versionNote?.message} /></AdminFormField>
        <AdminFormField label="Cảnh báo / lưu ý"><Textarea {...form.register("warningText")} rows={5} placeholder="Mỗi dòng một lưu ý" /></AdminFormField>
      </div>
    </AdminDetailSection>
  );
}

function VariantForm({ form }: { form: UseFormReturn<VariantFormValues> }) {
  const { errors } = form.formState;
  const values = form.watch();
  return (
    <AdminDetailSection title="Biến thể tình huống">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Tên biến thể *"><Input {...form.register("name")} className={invalidFieldClass(Boolean(errors.name))} /><FieldError message={errors.name?.message} /></AdminFormField>
        <AdminFormField label="Nhóm liên quan"><GroupSelect value={values.relatedGroup} onChange={(value) => form.setValue("relatedGroup", value, { shouldDirty: true, shouldValidate: true })} /></AdminFormField>
        <AdminFormField label="Tóm tắt *"><Textarea {...form.register("summary")} rows={4} className={invalidFieldClass(Boolean(errors.summary))} /><FieldError message={errors.summary?.message} /></AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Nguồn tham chiếu *"><Input {...form.register("sourceReference")} className={invalidFieldClass(Boolean(errors.sourceReference))} /><FieldError message={errors.sourceReference?.message} /></AdminFormField>
          <AdminFormField label="Thứ tự"><Input type="number" {...form.register("displayOrder", { valueAsNumber: true })} /><FieldError message={errors.displayOrder?.message} /></AdminFormField>
        </div>
        <AdminFormField label="Ghi chú biên tập *"><Textarea {...form.register("reviewNote")} rows={3} className={invalidFieldClass(Boolean(errors.reviewNote))} /><FieldError message={errors.reviewNote?.message} /></AdminFormField>
        <AdminFormField label="Cảnh báo / lưu ý"><Textarea {...form.register("warningText")} rows={5} placeholder="Mỗi dòng một lưu ý" /></AdminFormField>
      </div>
    </AdminDetailSection>
  );
}

function FaqForm({ form }: { form: UseFormReturn<FaqFormValues> }) {
  const { errors } = form.formState;
  return (
    <AdminDetailSection title="Hỏi đáp Ngôi Nhà Nhỏ">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Câu hỏi *"><Input {...form.register("question")} className={invalidFieldClass(Boolean(errors.question))} /><FieldError message={errors.question?.message} /></AdminFormField>
        <AdminFormField label="Câu trả lời *"><Textarea {...form.register("answer")} rows={10} className={invalidFieldClass(Boolean(errors.answer))} /><FieldError message={errors.answer?.message} /></AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Nguồn tham chiếu *"><Input {...form.register("sourceReference")} className={invalidFieldClass(Boolean(errors.sourceReference))} /><FieldError message={errors.sourceReference?.message} /></AdminFormField>
          <AdminFormField label="Thứ tự"><Input type="number" {...form.register("displayOrder", { valueAsNumber: true })} /><FieldError message={errors.displayOrder?.message} /></AdminFormField>
        </div>
      </div>
    </AdminDetailSection>
  );
}

function Sidebar({ group, slug, order, updatedAt, warningText }: { group?: string; slug?: string; order: number; updatedAt?: string; warningText?: string }) {
  return (
    <AdminDetailSection title="Thông tin">
      {group ? <AdminDetailField label="Nhóm" value={group} /> : null}
      {slug !== undefined ? <AdminDetailField label="Slug" value={slug || "Tự tạo khi lưu"} /> : null}
      <AdminDetailField label="Thứ tự" value={String(order)} />
      {warningText !== undefined ? <AdminDetailField label="Số cảnh báo" value={String(warnings(warningText).length)} /> : null}
      {updatedAt ? <AdminDetailField label="Cập nhật" value={new Date(updatedAt).toLocaleString("vi-VN")} /> : null}
    </AdminDetailSection>
  );
}

export function LittleHouseGuideCreatePage() {
  const navigateTo = useNavigateTo();
  const createGuide = useCreateLittleHouseGuide();
  const form = useAdminZodForm(guideSchema, { defaultValues: guideDefaults() });
  const values = form.watch();
  const handleSave = form.handleSubmit((formValues) => createGuide.mutate({ ...formValues, slug: formValues.slug || undefined, warningNotes: warnings(formValues.warningText) }, { onSuccess: () => navigateTo("/noi-dung/ngoi-nha-nho"), onError: (error) => applyApiFieldErrors(form, error) }));
  return <AdminDetailPage backHref="/noi-dung/ngoi-nha-nho" backLabel="Ngôi Nhà Nhỏ" title="Thêm bài hướng dẫn" onSave={() => void handleSave()} isSaving={createGuide.isPending} saveLabel="Tạo mới" saveDisabled={!values.title.trim() || !values.summary.trim() || !values.sourceReference.trim() || !values.versionNote.trim()} sidebar={<Sidebar group={groupLabels[values.groupKey]} slug={values.slug} order={values.displayOrder} warningText={values.warningText} />}><GuideForm form={form} /></AdminDetailPage>;
}

export function LittleHouseGuideDetailPage() {
  const publicId = readRouteParam(useParams({ strict: false }), "guidePublicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: overview, isLoading } = useQuery(littleHouseOverviewOptions());
  const item = overview?.guides.find((guide) => guide.publicId === publicId);
  const updateGuide = useUpdateLittleHouseGuide();
  const deleteGuide = useDeleteLittleHouseGuide();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useAdminZodForm(guideSchema, { defaultValues: guideDefaults(item) });
  const values = form.watch();
  useEffect(() => { if (item) form.reset(guideDefaults(item)); }, [form, item]);
  const handleSave = form.handleSubmit((formValues) => updateGuide.mutate({ publicId, ...formValues, slug: formValues.slug || undefined, warningNotes: warnings(formValues.warningText) }, { onError: (error) => applyApiFieldErrors(form, error) }));
  if (isLoading) return <WorkspaceDetailSkeleton />;
  return <>
    <AdminDetailPage backHref="/noi-dung/ngoi-nha-nho" backLabel="Ngôi Nhà Nhỏ" title={item?.title ?? "Không tìm thấy bài hướng dẫn"} onSave={() => void handleSave()} isSaving={updateGuide.isPending} saveDisabled={!item || !values.title.trim() || !values.summary.trim() || !values.sourceReference.trim() || !values.versionNote.trim()} actions={item ? [{ label: "Xoá bài hướng dẫn", variant: "destructive", onClick: () => setDeleteOpen(true) }] : []} sidebar={<Sidebar group={groupLabels[values.groupKey]} slug={values.slug} order={values.displayOrder} updatedAt={item?.updatedAt} warningText={values.warningText} />}>{item ? <GuideForm form={form} /> : <AdminDetailSection title="Không có dữ liệu"><p className="text-sm text-muted-foreground">Bản ghi này không tồn tại hoặc đã bị xoá.</p></AdminDetailSection>}</AdminDetailPage>
    <WorkspaceConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Xoá bài hướng dẫn Ngôi Nhà Nhỏ" description="Bản ghi này sẽ bị xoá khỏi workspace nội dung Ngôi Nhà Nhỏ." confirmLabel="Xoá" isPending={deleteGuide.isPending} onConfirm={() => deleteGuide.mutate(publicId, { onSuccess: () => navigateTo("/noi-dung/ngoi-nha-nho") })} />
  </>;
}

export function LittleHouseCaseVariantCreatePage() {
  const navigateTo = useNavigateTo();
  const createVariant = useCreateLittleHouseCaseVariant();
  const form = useAdminZodForm(variantSchema, { defaultValues: variantDefaults() });
  const values = form.watch();
  const handleSave = form.handleSubmit((formValues) => createVariant.mutate({ ...formValues, warningNotes: warnings(formValues.warningText) }, { onSuccess: () => navigateTo("/noi-dung/ngoi-nha-nho"), onError: (error) => applyApiFieldErrors(form, error) }));
  return <AdminDetailPage backHref="/noi-dung/ngoi-nha-nho" backLabel="Ngôi Nhà Nhỏ" title="Thêm biến thể tình huống" onSave={() => void handleSave()} isSaving={createVariant.isPending} saveLabel="Tạo mới" saveDisabled={!values.name.trim() || !values.summary.trim() || !values.sourceReference.trim() || !values.reviewNote.trim()} sidebar={<Sidebar group={groupLabels[values.relatedGroup]} order={values.displayOrder} warningText={values.warningText} />}><VariantForm form={form} /></AdminDetailPage>;
}

export function LittleHouseCaseVariantDetailPage() {
  const publicId = readRouteParam(useParams({ strict: false }), "variantPublicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: overview, isLoading } = useQuery(littleHouseOverviewOptions());
  const item = overview?.caseVariants.find((variant) => variant.publicId === publicId);
  const updateVariant = useUpdateLittleHouseCaseVariant();
  const deleteVariant = useDeleteLittleHouseCaseVariant();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useAdminZodForm(variantSchema, { defaultValues: variantDefaults(item) });
  const values = form.watch();
  useEffect(() => { if (item) form.reset(variantDefaults(item)); }, [form, item]);
  const handleSave = form.handleSubmit((formValues) => updateVariant.mutate({ publicId, ...formValues, warningNotes: warnings(formValues.warningText) }, { onError: (error) => applyApiFieldErrors(form, error) }));
  if (isLoading) return <WorkspaceDetailSkeleton />;
  return <>
    <AdminDetailPage backHref="/noi-dung/ngoi-nha-nho" backLabel="Ngôi Nhà Nhỏ" title={item?.name ?? "Không tìm thấy biến thể"} onSave={() => void handleSave()} isSaving={updateVariant.isPending} saveDisabled={!item || !values.name.trim() || !values.summary.trim() || !values.sourceReference.trim() || !values.reviewNote.trim()} actions={item ? [{ label: "Xoá biến thể", variant: "destructive", onClick: () => setDeleteOpen(true) }] : []} sidebar={<Sidebar group={groupLabels[values.relatedGroup]} order={values.displayOrder} updatedAt={item?.updatedAt} warningText={values.warningText} />}>{item ? <VariantForm form={form} /> : <AdminDetailSection title="Không có dữ liệu"><p className="text-sm text-muted-foreground">Bản ghi này không tồn tại hoặc đã bị xoá.</p></AdminDetailSection>}</AdminDetailPage>
    <WorkspaceConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Xoá biến thể tình huống" description="Biến thể này sẽ bị xoá khỏi workspace nội dung Ngôi Nhà Nhỏ." confirmLabel="Xoá" isPending={deleteVariant.isPending} onConfirm={() => deleteVariant.mutate(publicId, { onSuccess: () => navigateTo("/noi-dung/ngoi-nha-nho") })} />
  </>;
}

export function LittleHouseFaqCreatePage() {
  const navigateTo = useNavigateTo();
  const createFaq = useCreateLittleHouseFaq();
  const form = useAdminZodForm(faqSchema, { defaultValues: faqDefaults() });
  const values = form.watch();
  const handleSave = form.handleSubmit((formValues) => createFaq.mutate(formValues, { onSuccess: () => navigateTo("/noi-dung/ngoi-nha-nho"), onError: (error) => applyApiFieldErrors(form, error) }));
  return <AdminDetailPage backHref="/noi-dung/ngoi-nha-nho" backLabel="Ngôi Nhà Nhỏ" title="Thêm mục hỏi đáp" onSave={() => void handleSave()} isSaving={createFaq.isPending} saveLabel="Tạo mới" saveDisabled={!values.question.trim() || !values.answer.trim() || !values.sourceReference.trim()} sidebar={<Sidebar order={values.displayOrder} />}><FaqForm form={form} /></AdminDetailPage>;
}

export function LittleHouseFaqDetailPage() {
  const publicId = readRouteParam(useParams({ strict: false }), "faqPublicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: overview, isLoading } = useQuery(littleHouseOverviewOptions());
  const item = overview?.faq.find((faq) => faq.publicId === publicId);
  const updateFaq = useUpdateLittleHouseFaq();
  const deleteFaq = useDeleteLittleHouseFaq();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useAdminZodForm(faqSchema, { defaultValues: faqDefaults(item) });
  const values = form.watch();
  useEffect(() => { if (item) form.reset(faqDefaults(item)); }, [form, item]);
  const handleSave = form.handleSubmit((formValues) => updateFaq.mutate({ publicId, ...formValues }, { onError: (error) => applyApiFieldErrors(form, error) }));
  if (isLoading) return <WorkspaceDetailSkeleton />;
  return <>
    <AdminDetailPage backHref="/noi-dung/ngoi-nha-nho" backLabel="Ngôi Nhà Nhỏ" title={item?.question ?? "Không tìm thấy mục hỏi đáp"} onSave={() => void handleSave()} isSaving={updateFaq.isPending} saveDisabled={!item || !values.question.trim() || !values.answer.trim() || !values.sourceReference.trim()} actions={item ? [{ label: "Xoá mục hỏi đáp", variant: "destructive", onClick: () => setDeleteOpen(true) }] : []} sidebar={<Sidebar order={values.displayOrder} updatedAt={item?.updatedAt} />}>{item ? <FaqForm form={form} /> : <AdminDetailSection title="Không có dữ liệu"><p className="text-sm text-muted-foreground">Bản ghi này không tồn tại hoặc đã bị xoá.</p></AdminDetailSection>}</AdminDetailPage>
    <WorkspaceConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Xoá mục hỏi đáp Ngôi Nhà Nhỏ" description="Mục hỏi đáp này sẽ bị xoá khỏi workspace nội dung Ngôi Nhà Nhỏ." confirmLabel="Xoá" isPending={deleteFaq.isPending} onConfirm={() => deleteFaq.mutate(publicId, { onSuccess: () => navigateTo("/noi-dung/ngoi-nha-nho") })} />
  </>;
}
