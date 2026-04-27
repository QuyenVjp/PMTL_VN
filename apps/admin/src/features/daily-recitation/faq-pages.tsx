import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

import {
  AdminDetailField,
  AdminDetailPage,
  AdminDetailSection,
  AdminFormField,
  WorkspaceConfirmDialog,
  WorkspaceDetailSkeleton,
} from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { readRouteParam, useNavigateTo } from "@/lib/router-utils";
import { useCreateDailyPracticeFaq, useDeleteDailyPracticeFaq, useUpdateDailyPracticeFaq } from "./workspace-mutations.js";
import { dailyPracticeFaqItemOptions, type DailyPracticeFaq } from "./workspace-queries.js";

const faqSchema = z.object({
  question: z.string().trim().min(1, "Câu hỏi không được để trống."),
  answer: z.string().trim().min(1, "Câu trả lời không được để trống."),
  category: z.string().trim().min(1, "Nhóm hỏi đáp không được để trống."),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0, "Thứ tự phải từ 0 trở lên."),
});

type FaqFormValues = z.infer<typeof faqSchema>;

function buildDefaultValues(faq?: DailyPracticeFaq): FaqFormValues {
  return {
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    category: faq?.category ?? "general",
    featured: faq?.featured ?? false,
    sortOrder: faq?.sortOrder ?? 0,
  };
}

function FaqForm({ form }: { form: UseFormReturn<FaqFormValues> }) {
  const values = form.watch();
  const { errors } = form.formState;

  return (
    <AdminDetailSection title="Hỏi đáp Kinh bài tập">
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
          <AdminFormField label="Nhóm hỏi đáp">
            <Input {...form.register("category")} className={invalidFieldClass(Boolean(errors.category))} />
            <FieldError message={errors.category?.message} />
          </AdminFormField>
          <AdminFormField label="Thứ tự">
            <Input type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
            <FieldError message={errors.sortOrder?.message} />
          </AdminFormField>
        </div>
        <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
          <Checkbox
            checked={values.featured}
            onCheckedChange={(checked) => form.setValue("featured", checked === true, { shouldDirty: true })}
          />
          <Label>Nổi bật trên đầu danh sách hỏi đáp</Label>
        </div>
      </div>
    </AdminDetailSection>
  );
}

function FaqSidebar({ faq, values }: { faq?: DailyPracticeFaq; values: FaqFormValues }) {
  return (
    <>
      <AdminDetailSection title="Thông tin">
        <AdminDetailField label="Nhóm hỏi đáp" value={values.category || "general"} />
        <AdminDetailField label="Thứ tự" value={String(values.sortOrder || 0)} />
        <AdminDetailField label="Nổi bật" value={values.featured ? "Có" : "Không"} />
      </AdminDetailSection>
      {faq ? (
        <AdminDetailSection title="Lịch sử">
          <AdminDetailField label="Tạo lúc" value={new Date(faq.createdAt).toLocaleString("vi-VN")} />
          <AdminDetailField label="Cập nhật" value={new Date(faq.updatedAt).toLocaleString("vi-VN")} />
        </AdminDetailSection>
      ) : null}
    </>
  );
}

export function DailyPracticeFaqCreatePage() {
  const navigateTo = useNavigateTo();
  const createFaq = useCreateDailyPracticeFaq();
  const form = useAdminZodForm(faqSchema, { defaultValues: buildDefaultValues() });
  const values = form.watch();

  const handleSave = form.handleSubmit((formValues) => {
    createFaq.mutate(
      {
        question: formValues.question,
        answer: formValues.answer,
        category: formValues.category,
        featured: formValues.featured,
        sortOrder: Number(formValues.sortOrder),
      },
      {
        onSuccess: () => navigateTo("/noi-dung/kinh-bai-tap"),
        onError: (error) => applyApiFieldErrors(form, error),
      },
    );
  });

  return (
    <AdminDetailPage
      backHref="/noi-dung/kinh-bai-tap"
      backLabel="Kinh bài tập"
      title="Tạo mục hỏi đáp"
      status={values.featured ? <Badge variant="outline">Nổi bật</Badge> : <Badge variant="outline">Thường</Badge>}
      onSave={() => void handleSave()}
      isSaving={createFaq.isPending}
      saveLabel="Tạo mới"
      saveDisabled={!values.question.trim() || !values.answer.trim()}
      sidebar={<FaqSidebar values={values} />}
    >
      <FaqForm form={form} />
    </AdminDetailPage>
  );
}

export function DailyPracticeFaqDetailPage() {
  const params = useParams({ strict: false });
  const publicId = readRouteParam(params, "publicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: faq, isLoading } = useQuery(dailyPracticeFaqItemOptions(publicId));
  const updateFaq = useUpdateDailyPracticeFaq();
  const deleteFaq = useDeleteDailyPracticeFaq();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useAdminZodForm(faqSchema, { defaultValues: buildDefaultValues(faq) });
  const values = form.watch();

  useEffect(() => {
    if (faq) form.reset(buildDefaultValues(faq));
  }, [faq, form]);

  const handleSave = form.handleSubmit((formValues) => {
    updateFaq.mutate(
      {
        publicId,
        question: formValues.question,
        answer: formValues.answer,
        category: formValues.category,
        featured: formValues.featured,
        sortOrder: Number(formValues.sortOrder),
      },
      { onError: (error) => applyApiFieldErrors(form, error) },
    );
  });

  if (isLoading) return <WorkspaceDetailSkeleton />;

  return (
    <>
      <AdminDetailPage
        backHref="/noi-dung/kinh-bai-tap"
        backLabel="Kinh bài tập"
        title={faq?.question ?? "Mục hỏi đáp"}
        status={values.featured ? <Badge variant="outline">Nổi bật</Badge> : <Badge variant="outline">Thường</Badge>}
        onSave={() => void handleSave()}
        isSaving={updateFaq.isPending}
        saveDisabled={!values.question.trim() || !values.answer.trim()}
        actions={[
          {
            label: "Xoá mục hỏi đáp",
            variant: "destructive",
            onClick: () => setDeleteOpen(true),
          },
        ]}
        sidebar={<FaqSidebar faq={faq} values={values} />}
      >
        <FaqForm form={form} />
      </AdminDetailPage>
      <WorkspaceConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá mục hỏi đáp"
        description="Mục hỏi đáp này sẽ bị xoá khỏi workspace Kinh bài tập."
        confirmLabel="Xoá"
        isPending={deleteFaq.isPending}
        onConfirm={() =>
          deleteFaq.mutate(publicId, {
            onSuccess: () => navigateTo("/noi-dung/kinh-bai-tap"),
          })
        }
      />
    </>
  );
}
