import { useEffect, useMemo, useState } from "react";
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
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { readRouteParam, useNavigateTo } from "@/lib/router-utils";
import {
  useCreateDailyPracticePreset,
  useDeleteDailyPracticePreset,
  useUpdateDailyPracticePreset,
} from "./workspace-mutations.js";
import {
  dailyPracticeGuidesOptions,
  dailyPracticePresetOptions,
  type DailyPracticeGuide,
  type DailyPracticePreset,
} from "./workspace-queries.js";

const presetSchema = z.object({
  name: z.string().trim().min(1, "Tên kịch bản không được để trống."),
  scenarioType: z.string().trim().min(1, "Loại tình huống không được để trống."),
  practiceCount: z.number().int().min(0, "Số bài phải từ 0 trở lên."),
  guideIds: z.array(z.string()),
});

type PresetFormValues = z.infer<typeof presetSchema>;

const difficultyLabels: Record<DailyPracticeGuide["difficulty"], string> = {
  BEGINNER: "Bài niệm/chú cốt lõi",
  INTERMEDIATE: "Bài bổ trợ theo tình huống",
  ADVANCED: "Bài kết khóa / cần rà soát",
};

function isCoreChant(guide: DailyPracticeGuide) {
  return guide.sortOrder >= 1 && guide.sortOrder <= 9 && !guide.title.startsWith("Kinh bài tập:");
}

function buildDefaultValues(preset?: DailyPracticePreset): PresetFormValues {
  return {
    name: preset?.name ?? "",
    scenarioType: preset?.scenarioType ?? "",
    practiceCount: preset?.practiceCount ?? 0,
    guideIds: preset?.guideIds ?? [],
  };
}

function PresetForm({
  form,
  guides,
}: {
  form: UseFormReturn<PresetFormValues>;
  guides: DailyPracticeGuide[];
}) {
  const values = form.watch();
  const { errors } = form.formState;
  const selectedIds = values.guideIds ?? [];

  return (
    <AdminDetailSection title="Kịch bản niệm Kinh bài tập">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Tên kịch bản *">
          <Input {...form.register("name")} className={invalidFieldClass(Boolean(errors.name))} />
          <FieldError message={errors.name?.message} />
        </AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Loại tình huống *">
            <Input {...form.register("scenarioType")} className={invalidFieldClass(Boolean(errors.scenarioType))} />
            <FieldError message={errors.scenarioType?.message} />
          </AdminFormField>
          <AdminFormField label="Số bài niệm/chú gợi ý">
            <Input type="number" {...form.register("practiceCount", { valueAsNumber: true })} />
            <FieldError message={errors.practiceCount?.message} />
          </AdminFormField>
        </div>
        <AdminFormField label="9 bài niệm/chú cốt lõi đi kèm">
          <div className="grid gap-2 rounded-lg border p-3">
            {guides.length ? (
              guides.map((guide) => {
                const checked = selectedIds.includes(guide.publicId);
                return (
                  <label key={guide.publicId} className="flex items-start gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) => {
                        const nextIds = next
                          ? [...selectedIds, guide.publicId]
                          : selectedIds.filter((id) => id !== guide.publicId);
                        form.setValue("guideIds", Array.from(new Set(nextIds)), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                    <span>
                      <span className="font-medium text-foreground">{guide.title}</span>
                      <span className="block text-muted-foreground">{difficultyLabels[guide.difficulty]}</span>
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu 9 bài niệm/chú cốt lõi.</p>
            )}
          </div>
          <FieldError message={errors.guideIds?.message} />
        </AdminFormField>
      </div>
    </AdminDetailSection>
  );
}

function PresetSidebar({ preset, values }: { preset?: DailyPracticePreset; values: PresetFormValues }) {
  return (
    <>
      <AdminDetailSection title="Thông tin">
        <AdminDetailField label="Loại tình huống" value={values.scenarioType || "Chưa nhập"} />
        <AdminDetailField label="Số bài gợi ý" value={`${values.practiceCount || 0} bài niệm/chú`} />
        <AdminDetailField label="Bài đã chọn" value={`${values.guideIds?.length ?? 0} bài`} />
      </AdminDetailSection>
      {preset ? (
        <AdminDetailSection title="Lịch sử">
          <AdminDetailField label="Tạo lúc" value={new Date(preset.createdAt).toLocaleString("vi-VN")} />
          <AdminDetailField label="Cập nhật" value={new Date(preset.updatedAt).toLocaleString("vi-VN")} />
        </AdminDetailSection>
      ) : null}
    </>
  );
}

export function DailyPracticePresetCreatePage() {
  const navigateTo = useNavigateTo();
  const createPreset = useCreateDailyPracticePreset();
  const { data: guidesEnvelope, isLoading } = useQuery(dailyPracticeGuidesOptions());
  const guides = useMemo(() => (guidesEnvelope?.data ?? []).filter(isCoreChant), [guidesEnvelope?.data]);
  const form = useAdminZodForm(presetSchema, { defaultValues: buildDefaultValues() });
  const values = form.watch();

  const handleSave = form.handleSubmit((formValues) => {
    createPreset.mutate(
      {
        name: formValues.name,
        scenarioType: formValues.scenarioType,
        practiceCount: Number(formValues.practiceCount),
        guideIds: formValues.guideIds ?? [],
      },
      {
        onSuccess: () => navigateTo("/noi-dung/kinh-bai-tap"),
        onError: (error) => applyApiFieldErrors(form, error),
      },
    );
  });

  if (isLoading) return <WorkspaceDetailSkeleton />;

  return (
    <AdminDetailPage
      backHref="/noi-dung/kinh-bai-tap"
      backLabel="Kinh bài tập"
      title="Tạo scenario preset"
      status={<Badge variant="outline">{values.guideIds?.length ?? 0} bài đã chọn</Badge>}
      onSave={() => void handleSave()}
      isSaving={createPreset.isPending}
      saveLabel="Tạo mới"
      saveDisabled={!values.name.trim() || !values.scenarioType.trim()}
      sidebar={<PresetSidebar values={values} />}
    >
      <PresetForm form={form} guides={guides} />
    </AdminDetailPage>
  );
}

export function DailyPracticePresetDetailPage() {
  const params = useParams({ strict: false });
  const publicId = readRouteParam(params, "publicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: preset, isLoading: presetLoading } = useQuery(dailyPracticePresetOptions(publicId));
  const { data: guidesEnvelope, isLoading: guidesLoading } = useQuery(dailyPracticeGuidesOptions());
  const guides = useMemo(() => (guidesEnvelope?.data ?? []).filter(isCoreChant), [guidesEnvelope?.data]);
  const updatePreset = useUpdateDailyPracticePreset();
  const deletePreset = useDeleteDailyPracticePreset();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useAdminZodForm(presetSchema, { defaultValues: buildDefaultValues(preset) });
  const values = form.watch();

  useEffect(() => {
    if (preset) form.reset(buildDefaultValues(preset));
  }, [form, preset]);

  const handleSave = form.handleSubmit((formValues) => {
    updatePreset.mutate(
      {
        publicId,
        name: formValues.name,
        scenarioType: formValues.scenarioType,
        practiceCount: Number(formValues.practiceCount),
        guideIds: formValues.guideIds ?? [],
      },
      { onError: (error) => applyApiFieldErrors(form, error) },
    );
  });

  if (presetLoading || guidesLoading) return <WorkspaceDetailSkeleton />;

  return (
    <>
      <AdminDetailPage
        backHref="/noi-dung/kinh-bai-tap"
        backLabel="Kinh bài tập"
        title={preset?.name ?? "Scenario preset"}
        status={<Badge variant="outline">{values.guideIds?.length ?? 0} bài đã chọn</Badge>}
        onSave={() => void handleSave()}
        isSaving={updatePreset.isPending}
        saveDisabled={!values.name.trim() || !values.scenarioType.trim()}
        actions={[
          {
            label: "Xoá scenario preset",
            variant: "destructive",
            onClick: () => setDeleteOpen(true),
          },
        ]}
        sidebar={<PresetSidebar preset={preset} values={values} />}
      >
        <PresetForm form={form} guides={guides} />
      </AdminDetailPage>
      <WorkspaceConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xoá scenario preset"
        description="Kịch bản này sẽ bị xoá khỏi workspace Kinh bài tập."
        confirmLabel="Xoá"
        isPending={deletePreset.isPending}
        onConfirm={() =>
          deletePreset.mutate(publicId, {
            onSuccess: () => navigateTo("/noi-dung/kinh-bai-tap"),
          })
        }
      />
    </>
  );
}
