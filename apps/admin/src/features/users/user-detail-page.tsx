import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { LockIcon, UnlockIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminDetailPage,
  AdminDetailSection,
  AdminDetailField,
  AdminFormField,
  WorkspaceConfirmDialog,
} from "@/components/workspace";
import { FieldError } from "@/components/ui/field-error";

import { resolveMediaSrc } from "@/lib/media-src";
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation";

import { userDetailOptions } from "@/features/users/queries";
import {
  useUpdateProfile,
  useChangeRole,
  useBlockUser,
  useUnblockUser,
} from "@/features/users/mutations";
import {
  initials,
  statusBadgeClass,
  statusLabel,
  roleOptions,
  type ApiUserRole,
} from "@/features/users/types";

export function UserDetailPage() {
  const { publicId } = useParams({ strict: false });

  const { data: envelope, isLoading, isError } = useQuery(
    userDetailOptions(publicId ?? ""),
  );
  const user = envelope?.data;

  const updateProfile = useUpdateProfile();
  const changeRole = useChangeRole();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ApiUserRole>("MEMBER");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [confirmBlock, setConfirmBlock] = useState(false);
  const [confirmUnblock, setConfirmUnblock] = useState(false);

  // Sync form state when user data loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setEmail(user.email);
      setRole(user.role);
      setFieldErrors({});
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;

    const nextErrors: FieldErrors = {};
    if (!displayName.trim()) nextErrors.displayName = "Tên hiển thị không được để trống.";
    if (!email.trim()) nextErrors.email = "Email không được để trống.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      toast.error(String(Object.values(nextErrors)[0]));
      return;
    }
    setFieldErrors({});

    const profileChanged =
      displayName !== user.displayName || email !== user.email;
    const roleChanged = role !== user.role;

    const promises: Promise<unknown>[] = [];

    if (profileChanged) {
      promises.push(
        updateProfile.mutateAsync({
          publicId: user.publicId,
          input: {
            ...(displayName !== user.displayName && { displayName: displayName.trim() }),
            ...(email !== user.email && { email: email.trim() }),
          },
        }),
      );
    }

    if (roleChanged) {
      promises.push(
        changeRole.mutateAsync({
          publicId: user.publicId,
          input: { role },
        }),
      );
    }

    if (promises.length === 0) {
      toast.info("Không có thay đổi nào để lưu.");
      return;
    }

    Promise.all(promises).catch((error: unknown) => {
      setFieldErrors(extractValidationFieldErrors(error));
    });
  };

  const isSaving = updateProfile.isPending || changeRole.isPending;

  const handleBlock = () => {
    if (!user) return;
    blockUser.mutate(
      { publicId: user.publicId },
      {
        onSuccess: () => {
          setConfirmBlock(false);
        },
      },
    );
  };

  const handleUnblock = () => {
    if (!user) return;
    unblockUser.mutate(
      { publicId: user.publicId },
      {
        onSuccess: () => {
          setConfirmUnblock(false);
        },
      },
    );
  };

  // ── Loading / error states ────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-destructive">
        Không tải được thông tin người dùng.
      </div>
    );
  }

  // ── Sidebar ───────────────────────────────────────────────────────

  const sidebar = (
    <>
      <AdminDetailSection title="Trạng thái tài khoản">
        <AdminDetailField
          label="Trạng thái"
          value={
            <Badge variant="outline" className={statusBadgeClass(user.status)}>
              {statusLabel(user.status)}
            </Badge>
          }
        />
        <AdminDetailField
          label="Ngày tham gia"
          value={new Date(user.createdAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
        <AdminDetailField
          label="Lần cuối active"
          value={
            user.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleString("vi-VN")
              : undefined
          }
        />
        <AdminDetailField
          label="Email xác minh"
          value={
            user.emailVerifiedAt
              ? new Date(user.emailVerifiedAt).toLocaleDateString("vi-VN")
              : "Chưa xác minh"
          }
        />
        <AdminDetailField label="Số phiên" value={String(user.sessionCount)} />
        <AdminDetailField label="Số bài đăng" value={String(user.postCount)} />

        <div className="mt-4">
          {user.status === "ACTIVE" ? (
            <button
              type="button"
              onClick={() => setConfirmBlock(true)}
              disabled={blockUser.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <LockIcon className="size-3.5" />
              Khóa tài khoản
            </button>
          ) : user.status === "SUSPENDED" ? (
            <button
              type="button"
              onClick={() => setConfirmUnblock(true)}
              disabled={unblockUser.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              <UnlockIcon className="size-3.5" />
              Mở khóa tài khoản
            </button>
          ) : null}
        </div>
      </AdminDetailSection>
    </>
  );

  // ── Actions dropdown ──────────────────────────────────────────────

  const actions =
    user.status === "ACTIVE"
      ? [
          {
            label: "Khóa tài khoản",
            onClick: () => setConfirmBlock(true),
            variant: "destructive" as const,
            icon: LockIcon,
          },
        ]
      : user.status === "SUSPENDED"
        ? [
            {
              label: "Mở khóa tài khoản",
              onClick: () => setConfirmUnblock(true),
              icon: UnlockIcon,
            },
          ]
        : [];

  return (
    <>
      <AdminDetailPage
        backHref="/nguoi-dung"
        backLabel="Người dùng"
        title={user.displayName}
        status={
          <Badge variant="outline" className={statusBadgeClass(user.status)}>
            {statusLabel(user.status)}
          </Badge>
        }
        onSave={handleSave}
        isSaving={isSaving}
        saveLabel="Lưu thay đổi"
        actions={actions}
        sidebar={sidebar}
      >
        {/* ── Hồ sơ ──────────────────────────────────────────── */}
        <AdminDetailSection title="Hồ sơ">
          <div className="space-y-5">
            {/* Avatar — read-only display */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-2xl">
                <AvatarImage
                  src={resolveMediaSrc(user.avatarUrl) ?? undefined}
                  alt={user.displayName}
                />
                <AvatarFallback className="rounded-2xl text-lg">
                  {initials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <AdminFormField label="Tên hiển thị">
              <Input
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (fieldErrors.displayName)
                    setFieldErrors((prev) => ({ ...prev, displayName: "" }));
                }}
                className={invalidFieldClass(Boolean(fieldErrors.displayName))}
                placeholder="Nhập tên hiển thị"
              />
              <FieldError message={fieldErrors.displayName} />
            </AdminFormField>

            <AdminFormField label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={invalidFieldClass(Boolean(fieldErrors.email))}
                placeholder="Nhập địa chỉ email"
              />
              <FieldError message={fieldErrors.email} />
            </AdminFormField>
          </div>
        </AdminDetailSection>

        {/* ── Vai trò ─────────────────────────────────────────── */}
        <AdminDetailSection title="Vai trò">
          <AdminFormField label="Vai trò người dùng">
            <Select value={role} onValueChange={(v) => setRole(v as ApiUserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminFormField>
        </AdminDetailSection>
      </AdminDetailPage>

      {/* ── Confirm dialogs ───────────────────────────────────── */}
      <WorkspaceConfirmDialog
        open={confirmBlock}
        onOpenChange={(v) => { if (!v) setConfirmBlock(false); }}
        title="Khóa tài khoản"
        description={
          <>
            Khóa{" "}
            <span className="font-semibold text-foreground">{user.displayName}</span>?
            Tất cả phiên đăng nhập sẽ bị thu hồi ngay lập tức.
          </>
        }
        confirmLabel="Khóa tài khoản"
        variant="destructive"
        isPending={blockUser.isPending}
        onConfirm={handleBlock}
      />

      <WorkspaceConfirmDialog
        open={confirmUnblock}
        onOpenChange={(v) => { if (!v) setConfirmUnblock(false); }}
        title="Mở khóa tài khoản"
        description={
          <>
            Mở khóa{" "}
            <span className="font-semibold text-foreground">{user.displayName}</span>{" "}
            để họ có thể đăng nhập lại?
          </>
        }
        confirmLabel="Xác nhận mở khóa"
        isPending={unblockUser.isPending}
        onConfirm={handleUnblock}
      />
    </>
  );
}
