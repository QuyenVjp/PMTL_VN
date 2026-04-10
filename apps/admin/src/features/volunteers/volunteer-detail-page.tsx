import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  AdminFormField,
  WorkspaceConfirmDialog,
} from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { volunteerDetailOptions } from "@/features/volunteers/queries";
import { useUpdateVolunteer, useDeleteVolunteer } from "@/features/volunteers/mutations";
import {
  extractValidationFieldErrors,
  hasFieldErrors,
  invalidFieldClass,
  type FieldErrors,
} from "@/lib/form-validation";

export function VolunteerDetailPage() {
  const navigate = useNavigate();
  const { publicId } = useParams({ strict: false });

  const { data: volunteer, isLoading } = useQuery(volunteerDetailOptions(publicId ?? ""));

  const updateVolunteer = useUpdateVolunteer();
  const deleteVolunteer = useDeleteVolunteer();

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [zaloLink, setZaloLink] = useState("");
  const [bio, setBio] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!volunteer) return;
    setDisplayName(volunteer.displayName);
    setRole(volunteer.role);
    setAvatarUrl(volunteer.avatarUrl ?? "");
    setPhone(volunteer.phone ?? "");
    setZaloLink(volunteer.zaloLink ?? "");
    setBio(volunteer.bio ?? "");
    setSortOrder(String(volunteer.sortOrder));
    setIsActive(volunteer.isActive);
    setFieldErrors({});
  }, [volunteer]);

  const handleSave = () => {
    const nextErrors: FieldErrors = {};
    if (!displayName.trim()) nextErrors.displayName = "Tên không được để trống.";
    if (!role.trim()) nextErrors.role = "Vai trò không được để trống.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }
    if (!volunteer) return;
    setFieldErrors({});
    updateVolunteer.mutate(
      {
        publicId: volunteer.publicId,
        input: {
          displayName: displayName.trim(),
          role: role.trim(),
          avatarUrl: avatarUrl.trim() || undefined,
          phone: phone.trim() || undefined,
          zaloLink: zaloLink.trim() || undefined,
          bio: bio.trim() || undefined,
          sortOrder: Number(sortOrder) || 0,
          isActive,
        },
      },
      {
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

  if (isLoading || !volunteer) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {isLoading ? "Đang tải..." : "Không tìm thấy phụng sự viên."}
      </div>
    );
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
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
            />
          </AdminFormField>
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              id="detail-volunteer-active"
              checked={isActive}
              onCheckedChange={(v) => setIsActive(v === true)}
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
        onSave={handleSave}
        isSaving={updateVolunteer.isPending}
        saveLabel="Lưu"
        saveDisabled={!displayName.trim() || !role.trim()}
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
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (fieldErrors.displayName) setFieldErrors((prev) => ({ ...prev, displayName: "" }));
                }}
                className={invalidFieldClass(Boolean(fieldErrors.displayName))}
              />
              <FieldError message={fieldErrors.displayName} />
            </AdminFormField>

            <AdminFormField label="Vai trò">
              <Input
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (fieldErrors.role) setFieldErrors((prev) => ({ ...prev, role: "" }));
                }}
                placeholder="Ví dụ: Điều phối viên"
                className={invalidFieldClass(Boolean(fieldErrors.role))}
              />
              <FieldError message={fieldErrors.role} />
            </AdminFormField>

            <AdminFormField label="Giới thiệu">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mô tả ngắn..."
                rows={3}
              />
            </AdminFormField>

            <AdminFormField label="Ảnh đại diện (URL)">
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </AdminFormField>

            <div className="grid grid-cols-2 gap-3">
              <AdminFormField label="Số điện thoại">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912..."
                />
              </AdminFormField>
              <AdminFormField label="Zalo">
                <Input
                  value={zaloLink}
                  onChange={(e) => setZaloLink(e.target.value)}
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
