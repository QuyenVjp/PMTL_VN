import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { z } from "zod";

import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  AdminFormField,
  WorkspaceConfirmDialog,
  WorkspaceDetailSkeleton,
} from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { volunteerDetailOptions } from "@/features/volunteers/queries";
import { useUpdateVolunteer, useDeleteVolunteer } from "@/features/volunteers/mutations";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { readRouteParam } from "@/lib/router-utils";

const volunteerDetailSchema = z.object({
  displayName: z.string().trim().min(1, "Tên không được để trống."),
  role: z.string().trim().min(1, "Vai trò không được để trống."),
  avatarUrl: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  zaloLink: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  sortOrder: z.coerce.number().catch(0),
  isActive: z.boolean(),
});

export function VolunteerDetailPage() {
  const navigate = useNavigate();
  const publicId = readRouteParam(useParams({ strict: false }), "publicId");

  const { data: volunteer, isLoading } = useQuery(volunteerDetailOptions(publicId ?? ""));

  const updateVolunteer = useUpdateVolunteer();
  const deleteVolunteer = useDeleteVolunteer();

  const form = useAdminZodForm(volunteerDetailSchema, {
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!volunteer) return;
    form.reset({
      displayName: volunteer.displayName,
      role: volunteer.role,
      avatarUrl: volunteer.avatarUrl ?? "",
      phone: volunteer.phone ?? "",
      zaloLink: volunteer.zaloLink ?? "",
      bio: volunteer.bio ?? "",
      sortOrder: volunteer.sortOrder,
      isActive: volunteer.isActive,
    });
  }, [volunteer]);

  const handleSave = form.handleSubmit((formValues) => {
    if (!volunteer) return;
    updateVolunteer.mutate(
      {
        publicId: volunteer.publicId,
        input: {
          displayName: formValues.displayName,
          role: formValues.role,
          avatarUrl: formValues.avatarUrl || undefined,
          phone: formValues.phone || undefined,
          zaloLink: formValues.zaloLink || undefined,
          bio: formValues.bio || undefined,
          sortOrder: Number(formValues.sortOrder) || 0,
          isActive: formValues.isActive,
        },
      },
      {
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  if (isLoading || !volunteer) {
    return isLoading ? <WorkspaceDetailSkeleton /> : <div className="flex h-64 items-center justify-center text-muted-foreground">Không tìm thấy phụng sự viên.</div>;
  }

  const sidebar = (
    <>
      <AdminDetailSection title="Trạng thái">
        <div className="space-y-1">
          <AdminDetailField
            label="Trạng thái"
            value={
              volunteer.isActive ? (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Đang hoạt động
                </Badge>
              ) : (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                  Không hoạt động
                </Badge>
              )
            }
          />
          <AdminDetailField
            label="Tạo lúc"
            value={new Date(volunteer.createdAt).toLocaleString("vi-VN")}
          />
          <AdminDetailField
            label="Cập nhật lúc"
            value={new Date(volunteer.updatedAt).toLocaleString("vi-VN")}
          />
        </div>
      </AdminDetailSection>

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
              id="detail-volunteer-active"
              checked={values.isActive}
              onCheckedChange={(v) => form.setValue("isActive", v === true, { shouldDirty: true })}
            />
            <label htmlFor="detail-volunteer-active" className="cursor-pointer text-sm font-medium">
              Đang hoạt động
            </label>
          </div>
        </div>
      </AdminDetailSection>
    </>
  );

  return (
    <>
      <AdminDetailPage
        backHref="/he-thong/phung-su-vien"
        backLabel="Phụng sự viên"
        title={volunteer.displayName}
        status={
          volunteer.isActive ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              Đang hoạt động
            </Badge>
          ) : (
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              Không hoạt động
            </Badge>
          )
        }
        onSave={() => {
          void handleSave();
        }}
        isSaving={updateVolunteer.isPending}
        saveLabel="Lưu"
        saveDisabled={!values.displayName.trim() || !values.role.trim()}
        actions={[
          {
            label: "Xoá",
            onClick: () => setConfirmDelete(true),
            variant: "destructive" as const,
          },
        ]}
        sidebar={sidebar}
      >
        <AdminDetailSection title="Thông tin">
          <div className="space-y-4">
            <AdminFormField label="Tên hiển thị">
              <Input
                {...form.register("displayName")}
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

      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá phụng sự viên"
        description={
          <>
            Xoá <span className="font-semibold text-foreground">{volunteer.displayName}</span>?
            Thao tác này không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteVolunteer.isPending}
        onConfirm={() =>
          deleteVolunteer.mutate(volunteer.publicId, {
            onSuccess: () => {
              setConfirmDelete(false);
              void navigate({ to: "/he-thong/phung-su-vien" });
            },
          })
        }
      />
    </>
  );
}
