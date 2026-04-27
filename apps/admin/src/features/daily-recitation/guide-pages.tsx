import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

import { AdminDetailField, AdminDetailPage, AdminDetailSection, AdminFormField, WorkspaceConfirmDialog, WorkspaceDetailSkeleton } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerField } from "@/components/media/media-picker-modal";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { readRouteParam, useNavigateTo } from "@/lib/router-utils";
import { useCreateDailyPracticeGuide, useDeleteDailyPracticeGuide, useUpdateDailyPracticeGuide } from "./workspace-mutations.js";
import {
  dailyPracticeGuideOptions,
  type DailyPracticeDifficulty,
  type DailyPracticeGuide,
  type DailyPracticeStatus,
} from "./workspace-queries.js";

const difficultyLabels: Record<DailyPracticeDifficulty, string> = {
  BEGINNER: "Bài niệm/chú cốt lõi",
  INTERMEDIATE: "Bài bổ trợ theo tình huống",
  ADVANCED: "Bài kết khóa / cần rà soát",
};

const statusLabels: Record<DailyPracticeStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã ẩn",
};

type GuideFormValues = {
  title: string;
  slug?: string;
  body: string;
  scriptureImageMediaPublicId: string;
  duration: number;
  difficulty: DailyPracticeDifficulty;
  status: DailyPracticeStatus;
  sortOrder: number;
};

const guideSchema: z.ZodType<GuideFormValues, GuideFormValues> = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  slug: z.string().trim().optional(),
  body: z.string().trim().min(1, "Nội dung không được để trống."),
  scriptureImageMediaPublicId: z.string().trim(),
  duration: z.number().int().min(0, "Thời lượng phải từ 0 trở lên."),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  sortOrder: z.number().int().min(0, "Thứ tự phải từ 0 trở lên."),
});

function statusBadgeClass(status: DailyPracticeStatus) {
  if (status === "PUBLISHED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  }
  if (status === "DRAFT") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  }
  return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400";
}

function buildDefaultValues(guide?: DailyPracticeGuide): GuideFormValues {
  return {
    title: guide?.title ?? "",
    slug: guide?.slug ?? "",
    body: guide?.body ?? "",
    scriptureImageMediaPublicId: guide?.scriptureImageMediaPublicId ?? "",
    duration: guide?.duration ?? 0,
    difficulty: guide?.difficulty ?? "BEGINNER",
    status: guide?.status ?? "DRAFT",
    sortOrder: guide?.sortOrder ?? 0,
  };
}

function GuideForm({ form, currentImageUrl }: { form: UseFormReturn<GuideFormValues>; currentImageUrl?: string | null }) {
  const values = form.watch();
  const { errors } = form.formState;

  return (
    <AdminDetailSection title="Bài niệm / bài chú">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Tiêu đề *">
          <Input {...form.register("title")} className={invalidFieldClass(Boolean(errors.title))} />
          <FieldError message={errors.title?.message} />
        </AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Slug">
            <Input {...form.register("slug")} />
          </AdminFormField>
        <AdminFormField label="Nhóm nội dung">
            <Select
              value={values.difficulty}
              onValueChange={(value) => form.setValue("difficulty", value as DailyPracticeDifficulty, { shouldDirty: true, shouldValidate: true })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(difficultyLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminFormField>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Trạng thái">
            <Select
              value={values.status}
              onValueChange={(value) => form.setValue("status", value as DailyPracticeStatus, { shouldDirty: true, shouldValidate: true })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminFormField>
          <AdminFormField label="Thứ tự">
            <Input type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
            <FieldError message={errors.sortOrder?.message} />
          </AdminFormField>
        </div>
        <AdminFormField label="Thời lượng dự kiến (phút)">
          <Input type="number" {...form.register("duration", { valueAsNumber: true })} />
          <FieldError message={errors.duration?.message} />
        </AdminFormField>
        <AdminFormField
          label="Ảnh/bản kinh để người dùng niệm"
          hint="Chọn ảnh scan, bản kinh hoặc tài liệu hình ảnh từ thư viện media. Không nhập publicId thủ công."
        >
          <MediaPickerField
            value={values.scriptureImageMediaPublicId}
            onChange={(publicId) => form.setValue("scriptureImageMediaPublicId", publicId, { shouldDirty: true, shouldValidate: true })}
            currentImageUrl={currentImageUrl ?? undefined}
            placeholder="Chọn ảnh/bản kinh từ thư viện..."
          />
          <FieldError message={errors.scriptureImageMediaPublicId?.message} />
        </AdminFormField>
        <AdminFormField label="Bản kinh, lời khấn, số biến và nguồn trích xuất">
          <Textarea {...form.register("body")} rows={14} className={invalidFieldClass(Boolean(errors.body))} />
          <FieldError message={errors.body?.message} />
        </AdminFormField>
      </div>
    </AdminDetailSection>
  );
}

function GuideSidebar({ guide, values }: { guide?: DailyPracticeGuide; values: GuideFormValues }) {
  return (
    <>
      <AdminDetailSection title="Thông tin">
        <AdminDetailField label="Trạng thái" value={statusLabels[values.status]} />
        <AdminDetailField label="Nhóm nội dung" value={difficultyLabels[values.difficulty]} />
        <AdminDetailField label="Thời lượng" value={`${values.duration} phút`} />
        <AdminDetailField label="Thứ tự" value={String(values.sortOrder)} />
      </AdminDetailSection>
      {guide ? (
        <AdminDetailSection title="Lịch sử">
          <AdminDetailField label="Tạo lúc" value={new Date(guide.createdAt).toLocaleString("vi-VN")} />
          <AdminDetailField label="Cập nhật" value={new Date(guide.updatedAt).toLocaleString("vi-VN")} />
          <AdminDetailField label="Xuất bản" value={guide.publishedAt ? new Date(guide.publishedAt).toLocaleString("vi-VN") : "Chưa xuất bản"} />
        </AdminDetailSection>
      ) : null}
    </>
  );
}

export function DailyPracticeGuideCreatePage() {
  const navigateTo = useNavigateTo();
  const createGuide = useCreateDailyPracticeGuide();
  const form = useAdminZodForm(guideSchema, { defaultValues: buildDefaultValues() });
  const values = form.watch();

  const handleSave = form.handleSubmit((formValues) => {
    createGuide.mutate(
      {
        title: formValues.title,
        slug: formValues.slug || undefined,
        body: formValues.body,
        scriptureImageMediaPublicId: formValues.scriptureImageMediaPublicId || undefined,
        duration: Number(formValues.duration),
        difficulty: formValues.difficulty,
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
      title="Tạo bài niệm / bài chú"
      status={<Badge variant="outline" className={statusBadgeClass(values.status)}>{statusLabels[values.status]}</Badge>}
      onSave={() => void handleSave()}
      isSaving={createGuide.isPending}
      saveLabel="Tạo mới"
      saveDisabled={!values.title.trim() || !values.body.trim()}
      sidebar={<GuideSidebar values={values} />}
    >
      <GuideForm form={form} />
    </AdminDetailPage>
  );
}

export function DailyPracticeGuideDetailPage() {
  const params = useParams({ strict: false });
  const publicId = readRouteParam(params, "publicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: guide, isLoading } = useQuery(dailyPracticeGuideOptions(publicId));
  const updateGuide = useUpdateDailyPracticeGuide();
  const deleteGuide = useDeleteDailyPracticeGuide();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useAdminZodForm(guideSchema, { defaultValues: buildDefaultValues(guide) });
  const values = form.watch();

  useEffect(() => {
    if (guide) form.reset(buildDefaultValues(guide));
  }, [form, guide]);

  const handleSave = form.handleSubmit((formValues) => {
    updateGuide.mutate(
      {
        publicId,
        title: formValues.title,
        slug: formValues.slug || undefined,
        body: formValues.body,
        scriptureImageMediaPublicId: formValues.scriptureImageMediaPublicId || null,
        duration: Number(formValues.duration),
        difficulty: formValues.difficulty,
        status: formValues.status,
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
        title={guide?.title ?? "Bài hướng dẫn"}
        status={<Badge variant="outline" className={statusBadgeClass(values.status)}>{statusLabels[values.status]}</Badge>}
        onSave={() => void handleSave()}
        isSaving={updateGuide.isPending}
        saveDisabled={!values.title.trim() || !values.body.trim()}
        actions={[
          {
            label: "Xoá bài niệm / bài chú",
            variant: "destructive",
            onClick: () => setDeleteOpen(true),
          },
        ]}
        sidebar={<GuideSidebar guide={guide} values={values} />}
      >
        <GuideForm form={form} currentImageUrl={guide?.scriptureImageUrl} />
      </AdminDetailPage>
      <WorkspaceConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá bài niệm / bài chú"
        description="Bài niệm/bài chú này sẽ bị xoá khỏi workspace Kinh bài tập."
        confirmLabel="Xoá"
        isPending={deleteGuide.isPending}
        onConfirm={() =>
          deleteGuide.mutate(publicId, {
            onSuccess: () => navigateTo("/noi-dung/kinh-bai-tap"),
          })
        }
      />
    </>
  );
}
