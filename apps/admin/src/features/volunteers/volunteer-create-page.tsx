import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

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
import {
  extractValidationFieldErrors,
  hasFieldErrors,
  invalidFieldClass,
  type FieldErrors,
} from "@/lib/form-validation";

export function VolunteerCreatePage() {
  const navigate = useNavigate();
  const createVolunteer = useCreateVolunteer();

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [zaloLink, setZaloLink] = useState("");
  const [bio, setBio] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSave = () => {
    const nextErrors: FieldErrors = {};
    if (!displayName.trim()) nextErrors.displayName = "Tên không được để trống.";
    if (!role.trim()) nextErrors.role = "Vai trò không được để trống.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }
    setFieldErrors({});
    createVolunteer.mutate(
      {
        displayName: displayName.trim(),
        role: role.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        phone: phone.trim() || undefined,
        zaloLink: zaloLink.trim() || undefined,
        bio: bio.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      },
      {
        onSuccess: () => {
          void navigate({ to: "/he-thong/phung-su-vien" });
        },
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

  const sidebar = (
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
            id="create-volunteer-active"
            checked={isActive}
            onCheckedChange={(v) => setIsActive(v === true)}
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
      onSave={handleSave}
      isSaving={createVolunteer.isPending}
      saveLabel="Thêm"
      saveDisabled={!displayName.trim() || !role.trim()}
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
              placeholder="Tên phụng sự viên..."
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
  );
}
