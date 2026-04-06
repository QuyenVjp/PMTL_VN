import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { usersAdminKeys } from "./queries.js";

/**
 * Users mutations per ADMIN_FEATURE_QUERY_PLAN line 42:
 * "user management + role assignments + permission control"
 */

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: string;
  status?: "ACTIVE" | "SUSPENDED" | "BANNED";
}

export interface CreateRoleInput {
  name: string;
  slug: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
}

/**
 * Update user
 */
export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateUserInput & { publicId: string }) =>
      adminClient.patch(`/admin/users/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Người dùng đã được cập nhật");
      void qc.invalidateQueries({ queryKey: usersAdminKeys.users.detail(publicId) });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.users.lists() });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Suspend user
 */
export function useSuspendUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/users/${publicId}/suspend`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Người dùng đã bị tạm ngừng");
      void qc.invalidateQueries({ queryKey: usersAdminKeys.users.detail(publicId) });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.users.lists() });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Ban user
 */
export function useBanUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/users/${publicId}/ban`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Người dùng đã bị cấm");
      void qc.invalidateQueries({ queryKey: usersAdminKeys.users.detail(publicId) });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.users.lists() });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Reactivate user
 */
export function useReactivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/users/${publicId}/reactivate`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Người dùng đã được kích hoạt lại");
      void qc.invalidateQueries({ queryKey: usersAdminKeys.users.detail(publicId) });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.users.lists() });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Create role
 */
export function useCreateRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/users/roles", input),
    onSuccess: () => {
      toast.success("✅ Vai trò đã được tạo");
      void qc.invalidateQueries({ queryKey: usersAdminKeys.roles.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update role
 */
export function useUpdateRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateRoleInput & { publicId: string }) =>
      adminClient.patch(`/admin/users/roles/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Vai trò đã được cập nhật");
      void qc.invalidateQueries({ queryKey: usersAdminKeys.roles.detail(publicId) });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.roles.lists() });
      void qc.invalidateQueries({ queryKey: usersAdminKeys.users.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Delete role
 */
export function useDeleteRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/users/roles/${publicId}`),
    onSuccess: () => {
      toast.success("✅ Vai trò đã được xóa");
      void qc.invalidateQueries({ queryKey: usersAdminKeys.roles.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Reset user password
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/users/${publicId}/reset-password`),
    onSuccess: () => {
      toast.success("✅ Liên kết đặt lại mật khẩu đã được gửi");
    },
    onError: handleApiError,
  });
}

/**
 * Export users
 */
export function useExportUsersMutation() {
  return useMutation({
    mutationFn: () =>
      adminClient.post<{ downloadUrl: string }>("/admin/users/export"),
    onSuccess: (response) => {
      toast.success("✅ Dữ liệu người dùng đã sẵn sàng tải xuống");
      if (response.downloadUrl) {
        window.location.href = response.downloadUrl;
      }
    },
    onError: handleApiError,
  });
}
