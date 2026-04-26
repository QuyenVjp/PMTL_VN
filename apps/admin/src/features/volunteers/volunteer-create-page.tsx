import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import {
  AdminDetailPage,
  AdminDetailSection,
  AdminFormField,
} from "@/components/workspace";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVolunteer } from "@/features/volunteers/mutations";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";

const volunteerCreateSchema = z.object({
  displayName: z.string().trim().min(1, "Tên không được để trống."),
  role: z.string().trim().min(1, "Vai trò không được để trống."),
  avatarUrl: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  zaloLink: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  sortOrder: z.coerce.number().catch(0),
  isActive: z.boolean(),
});

export function VolunteerCreatePage() {
  const navigate = useNavigate();
  const createVolunteer = useCreateVolunteer();
  const form = useAdminZodForm(volunteerCreateSchema, {
    defaultValues: {
      displayName: "",
      role: "",
      avatarUrl: "",
      phone: "",
      zaloLink: "",
      bio: "",
      sortOrder: 0,
      isActive: true,
    },
  });
  const { errors } = form.formState;
  const values = form.watch();

  const handleSave = form.handleSubmit((formValues) => {
    createVolunteer.mutate(
      {
        displayName: formValues.displayName,
        role: formValues.role,
        avatarUrl: formValues.avatarUrl || undefined,
        phone: formValues.phone || undefined,
        zaloLink: formValues.zaloLink || undefined,
        bio: formValues.bio || undefined,
        sortOrder: Number(formValues.sortOrder) || 0,
        isActive: formValues.isActive,
      },
      {
        onSuccess: () => {
          void navigate({ to: "/he-thong/phung-su-vien" });
        },
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  const sidebar = (
    <AdminDetailSection title="Cài đặt">
      <div className="space-y-4">
        <AdminFormField label="Thứ tự hiển thị">
          <Input
            type="number"
            {...form.register("sortOrder")}
            placeholder="0"
          />
        </AdminFormField>
        <div className="flex items-center gap-2 py-1">
          <Checkbox
            id="create-volunteer-active"
            checked={values.isActive}
            onCheckedChange={(v) => form.setValue("isActive", v === true, { shouldDirty: true })}
          />
          <label htmlFor="create-volunteer-active" className="cursor-pointer text-sm font-medium">
            Đang hoạt động
          </label>
        </div>
      </div>
    </AdminDetailSection>
  );

  return (
    <AdminDetailPage
      backHref="/he-thong/phung-su-vien"
      backLabel="Phụng sự viên"
      title="Thêm phụng sự viên mới"
      onSave={() => {
        void handleSave();
      }}
      isSaving={createVolunteer.isPending}
      saveLabel="Thêm"
      saveDisabled={!values.displayName.trim() || !values.role.trim()}
      sidebar={sidebar}
    >
      <AdminDetailSection title="Thông tin">
        <div className="space-y-4">
          <AdminFormField label="Tên hiển thị">
            <Input
              {...form.register("displayName")}
              placeholder="Tên phụng sự viên..."
              className={invalidFieldClass(Boolean(errors.displayName))}
            />
            <FieldError message={errors.displayName?.message} />
          </AdminFormField>

          <AdminFormField label="Vai trò">
            <Input
              {...form.register("role")}
              placeholder="Ví dụ: Điều phối viên"
              className={invalidFieldClass(Boolean(errors.role))}
            />
            <FieldError message={errors.role?.message} />
          </AdminFormField>

          <AdminFormField label="Giới thiệu">
            <Textarea
              {...form.register("bio")}
              placeholder="Mô tả ngắn..."
              rows={3}
            />
          </AdminFormField>

          <AdminFormField label="Ảnh đại diện (URL)">
            <Input
              {...form.register("avatarUrl")}
              placeholder="https://..."
            />
          </AdminFormField>

          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Số điện thoại">
              <Input
                {...form.register("phone")}
                placeholder="0912..."
              />
            </AdminFormField>
            <AdminFormField label="Zalo">
              <Input
                {...form.register("zaloLink")}
                placeholder="https://zalo.me/..."
              />
            </AdminFormField>
          </div>
        </div>
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
