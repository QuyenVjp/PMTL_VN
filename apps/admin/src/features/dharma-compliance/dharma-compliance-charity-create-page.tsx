import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminDetailPage, AdminDetailSection, AdminFormField } from "@/components/workspace";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { useCreateCharity } from "@/features/dharma-compliance/mutations";

const CHARITY_TYPE_OPTIONS = [
  { label: "Ngân hàng thực phẩm", value: "FOOD_BANK" },
  { label: "Y tế", value: "MEDICAL" },
  { label: "Giáo dục", value: "EDUCATION" },
  { label: "Cứu trợ thảm họa", value: "DISASTER_RELIEF" },
  { label: "Phúc lợi động vật", value: "ANIMAL_WELFARE" },
  { label: "Khác", value: "OTHER" },
];

const charityCreateSchema = z.object({
  name: z.string().trim().min(1, "Tên tổ chức không được để trống."),
  charityType: z.string().trim().min(1, "Vui lòng chọn loại tổ chức."),
  registrationNumber: z.string().trim().optional(),
  contactEmail: z.string().trim().optional(),
  websiteUrl: z.string().trim().optional(),
});

type CharityCreateValues = z.infer<typeof charityCreateSchema>;

export function DharmaComplianceCharityCreatePage() {
  const navigate = useNavigate();
  const createCharity = useCreateCharity();
  const form = useAdminZodForm(charityCreateSchema, {
    defaultValues: {
      name: "",
      charityType: "",
      registrationNumber: "",
      contactEmail: "",
      websiteUrl: "",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();

  const handleCreate = form.handleSubmit((formValues: CharityCreateValues) => {
    createCharity.mutate(
      {
        name: formValues.name,
        charityType: formValues.charityType,
        registrationNumber: formValues.registrationNumber || undefined,
        contactEmail: formValues.contactEmail || undefined,
        websiteUrl: formValues.websiteUrl || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã thêm tổ chức từ thiện.");
          void navigate({ to: "/phap-luat/to-chuc-tu-thien" });
        },
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <AdminDetailPage
      backHref="/phap-luat/to-chuc-tu-thien"
      backLabel="Tổ chức từ thiện"
      title="Thêm tổ chức từ thiện"
      onSave={() => {
        void handleCreate();
      }}
      saveLabel="Thêm tổ chức"
      isSaving={createCharity.isPending}
      saveDisabled={!values.name.trim() || !values.charityType}
      actions={[
        {
          label: "Huỷ",
          onClick: () => {
            void navigate({ to: "/phap-luat/to-chuc-tu-thien" });
          },
        },
      ]}
      sidebar={
        <AdminDetailSection title="Quy tắc vận hành">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>Tổ chức mới được đưa vào hàng kiểm tra trước khi dùng trong các luồng công khai.</p>
            <p>Thông tin liên hệ và website giúp reviewer xác minh nguồn chính xác hơn.</p>
          </div>
        </AdminDetailSection>
      }
    >
      <AdminDetailSection title="Thông tin tổ chức">
        <div className="flex flex-col gap-4">
          <AdminFormField label="Tên tổ chức *" invalid={Boolean(errors.name)}>
            <Input
              id="charity-name"
              {...form.register("name")}
              placeholder="Nhập tên tổ chức"
              aria-invalid={Boolean(errors.name)}
              className={invalidFieldClass(Boolean(errors.name))}
            />
            <FieldError message={errors.name?.message} />
          </AdminFormField>

          <AdminFormField label="Loại tổ chức *" invalid={Boolean(errors.charityType)}>
            <Select
              value={values.charityType}
              onValueChange={(v) => form.setValue("charityType", v, { shouldDirty: true, shouldValidate: true })}
            >
              <SelectTrigger
                id="charity-type"
                aria-invalid={Boolean(errors.charityType)}
                className={invalidFieldClass(Boolean(errors.charityType))}
              >
                <SelectValue placeholder="Chọn loại tổ chức" />
              </SelectTrigger>
              <SelectContent>
                {CHARITY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.charityType?.message} />
          </AdminFormField>

          <AdminFormField label="Mã đăng ký">
            <Input
              id="charity-reg"
              {...form.register("registrationNumber")}
              placeholder="Mã đăng ký (tuỳ chọn)"
            />
          </AdminFormField>

          <AdminFormField label="Email liên hệ">
            <Input
              id="charity-email"
              type="email"
              {...form.register("contactEmail")}
              placeholder="email@tổ-chức.vn"
            />
          </AdminFormField>

          <AdminFormField label="Website">
            <Input
              id="charity-web"
              {...form.register("websiteUrl")}
              placeholder="https://..."
            />
          </AdminFormField>
        </div>
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
