import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { LockIcon, UnlockIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
  WorkspaceDetailSkeleton,
} from "@/components/workspace";
import { FieldError } from "@/components/ui/field-error";

import { resolveMediaSrc } from "@/lib/media-src";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";
import { readRouteParam } from "@/lib/router-utils";

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

const userDetailSchema = z.object({
  displayName: z.string().trim().min(1, "Tên hiển thị không được để trống."),
  email: z.string().trim().min(1, "Email không được để trống."),
  role: z.enum(["MEMBER", "ADMIN", "SUPER_ADMIN"]),
});

export function UserDetailPage() {
  const publicId = readRouteParam(useParams({ strict: false }), "publicId");

  const { data: envelope, isLoading, isError } = useQuery(
    userDetailOptions(publicId ?? ""),
  );
  const user = envelope?.data;

  const updateProfile = useUpdateProfile();
  const changeRole = useChangeRole();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const form = useAdminZodForm(userDetailSchema, {
    defaultValues: {
      displayName: "",
      email: "",
      role: "MEMBER",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();

  const [confirmBlock, setConfirmBlock] = useState(false);
  const [confirmUnblock, setConfirmUnblock] = useState(false);

  // Sync form state when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const handleSave = form.handleSubmit((formValues) => {
    if (!user) return;

    const profileChanged =
      formValues.displayName !== user.displayName || formValues.email !== user.email;
    const roleChanged = formValues.role !== user.role;

    const promises: Promise<unknown>[] = [];

    if (profileChanged) {
      promises.push(
        updateProfile.mutateAsync({
            publicId: user.publicId,
            input: {
            ...(formValues.displayName !== user.displayName && { displayName: formValues.displayName }),
            ...(formValues.email !== user.email && { email: formValues.email }),
          },
        }),
      );
    }

    if (roleChanged) {
      promises.push(
        changeRole.mutateAsync({
          publicId: user.publicId,
          input: { role: formValues.role as ApiUserRole },
        }),
      );
    }

    if (promises.length === 0) {
      toast.info("Không có thay đổi nào để lưu.");
      return;
    }

    Promise.all(promises).catch((error: unknown) => {
      applyApiFieldErrors(form, error);
    });
  });

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
    return <WorkspaceDetailSkeleton />;
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
        onSave={() => {
          void handleSave();
        }}
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
                {...form.register("displayName")}
                className={invalidFieldClass(Boolean(errors.displayName))}
                placeholder="Nhập tên hiển thị"
              />
              <FieldError message={errors.displayName?.message} />
            </AdminFormField>

            <AdminFormField label="Email">
              <Input
                type="email"
                {...form.register("email")}
                className={invalidFieldClass(Boolean(errors.email))}
                placeholder="Nhập địa chỉ email"
              />
              <FieldError message={errors.email?.message} />
            </AdminFormField>
          </div>
        </AdminDetailSection>

        {/* ── Vai trò ─────────────────────────────────────────── */}
        <AdminDetailSection title="Vai trò">
          <AdminFormField label="Vai trò người dùng">
            <Select
              value={values.role}
              onValueChange={(v) => form.setValue("role", v as ApiUserRole, { shouldDirty: true })}
            >
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
