import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { AdminFormField, WorkspaceDetailSheet, WorkspaceDetailStandardSections } from "@/components/workspace";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { SacredFormTemplatesTable } from "./sacred-forms-templates-table.js";
import { useCreateTemplate } from "./mutations.js";
import { FORM_TYPE_LABELS, type SacredFormType } from "./types.js";

const FORM_TYPE_OPTIONS: { label: string; value: SacredFormType }[] = [
  { label: FORM_TYPE_LABELS.REFUGE_FORM, value: "REFUGE_FORM" },
  { label: FORM_TYPE_LABELS.VOW_FORM, value: "VOW_FORM" },
  { label: FORM_TYPE_LABELS.MERIT_TRANSFER_FORM, value: "MERIT_TRANSFER_FORM" },
  { label: FORM_TYPE_LABELS.RECITATION_CERTIFICATE, value: "RECITATION_CERTIFICATE" },
  { label: FORM_TYPE_LABELS.DHARMA_STUDY_FORM, value: "DHARMA_STUDY_FORM" },
];

const templateFormSchema = z.object({
  formType: z.enum(["REFUGE_FORM", "VOW_FORM", "MERIT_TRANSFER_FORM", "RECITATION_CERTIFICATE", "DHARMA_STUDY_FORM"]).or(z.literal("")),
  titleVi: z.string().trim().min(1, "Tên mẫu đơn không được để trống."),
  titleZh: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

export function SacredFormTemplatesPage() {
  const [open, setOpen] = useState(false);
  const createTemplate = useCreateTemplate();
  const form = useAdminZodForm(templateFormSchema, {
    defaultValues: {
      formType: "",
      titleVi: "",
      titleZh: "",
      description: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();

  const canCreate = Boolean(values.formType && values.titleVi.trim());

  function handleClose() {
    setOpen(false);
    form.reset({ formType: "", titleVi: "", titleZh: "", description: "" });
  }

  const handleSubmit = form.handleSubmit((formValues) => {
    if (!formValues.formType) {
      form.setError("formType", { type: "manual", message: "Vui lòng chọn loại đơn." }, { shouldFocus: true });
      return;
    }
    createTemplate.mutate(
      {
        formType: formValues.formType,
        titleVi: formValues.titleVi,
        titleZh: formValues.titleZh || undefined,
        description: formValues.description || undefined,
        isActive: true,
      },
      {
        onSuccess: handleClose,
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mẫu đơn Pháp Bảo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Danh sách mẫu đơn đăng ký hiện hành. Mỗi mẫu có thể bật/tắt trực tiếp ở bảng dưới.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Tạo mẫu đơn
        </Button>
      </div>

      <SacredFormTemplatesTable />

      <WorkspaceDetailSheet
        open={open}
        onOpenChange={(v) => (!v ? handleClose() : setOpen(true))}
        title="Tạo mẫu đơn mới"
        subtitle="Mẫu đơn đăng ký Pháp Bảo sẽ xuất hiện trong bảng sau khi tạo."
      >
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <AdminFormField label="Loại đơn *">
              <Select
                value={values.formType}
                onValueChange={(v) => form.setValue("formType", v as TemplateFormValues["formType"], { shouldDirty: true, shouldValidate: true })}
              >
                <SelectTrigger id="formType">
                  <SelectValue placeholder="Chọn loại đơn" />
                </SelectTrigger>
                <SelectContent>
                  {FORM_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.formType?.message} />
            </AdminFormField>

            <AdminFormField label="Tên mẫu đơn (tiếng Việt) *">
              <Input
                id="titleVi"
                {...form.register("titleVi")}
                aria-invalid={Boolean(errors.titleVi)}
                className={invalidFieldClass(errors.titleVi)}
                placeholder="Nhập tên mẫu đơn..."
              />
              <FieldError message={errors.titleVi?.message} />
            </AdminFormField>

            <AdminFormField label="Tên mẫu đơn (Hán tự)">
              <Input
                id="titleZh"
                {...form.register("titleZh")}
                aria-invalid={Boolean(errors.titleZh)}
                className={invalidFieldClass(errors.titleZh)}
                placeholder="Tuỳ chọn"
              />
              <FieldError message={errors.titleZh?.message} />
            </AdminFormField>

            <AdminFormField label="Mô tả">
              <Textarea
                id="description"
                {...form.register("description")}
                aria-invalid={Boolean(errors.description)}
                className={invalidFieldClass(errors.description)}
                placeholder="Mô tả ngắn về mẫu đơn (tuỳ chọn)"
                rows={3}
              />
              <FieldError message={errors.description?.message ?? errors.root?.server?.message} />
            </AdminFormField>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Huỷ
              </Button>
              <Button type="submit" disabled={!canCreate || createTemplate.isPending}>
                {createTemplate.isPending ? "Đang tạo..." : "Tạo mẫu đơn"}
              </Button>
            </div>
          </form>
      <WorkspaceDetailStandardSections />
      </WorkspaceDetailSheet>
    </div>
  );
}
