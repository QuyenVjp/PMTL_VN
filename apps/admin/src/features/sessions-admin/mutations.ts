import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { sessionsAdminKeys } from "./queries.js";

/**
 * Sessions mutations per ADMIN_FEATURE_QUERY_PLAN line 43:
 * "session management + revocation + device tracking"
 */

/**
 * Revoke session
 */
export function useRevokeSessionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/sessions/active/${publicId}/revoke`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Phiên đã được thu hồi");
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.active.detail(publicId) });
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.active.lists() });
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.overview() });
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.history.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Revoke all sessions for a user
 */
export function useRevokeUserSessionsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      adminClient.post(`/admin/sessions/users/${userId}/revoke-all`),
    onSuccess: () => {
      toast.success("✅ Tất cả các phiên của người dùng đã được thu hồi");
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.active.lists() });
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.overview() });
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.history.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Revoke all sessions globally
 */
export function useRevokeAllSessionsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      adminClient.post("/admin/sessions/revoke-all"),
    onSuccess: () => {
      toast.success("✅ Tất cả các phiên đã được thu hồi");
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.all });
    },
    onError: handleApiError,
  });
}

/**
 * Clear session history
 */
export function useClearSessionHistoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (daysOld: number = 30) =>
      adminClient.post(`/admin/sessions/history/clear?daysOld=${daysOld}`),
    onSuccess: () => {
      toast.success("✅ Lịch sử phiên đã được xóa");
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.history.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Block device
 */
export function useBlockDeviceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) =>
      adminClient.post(`/admin/sessions/devices/${deviceId}/block`),
    onSuccess: () => {
      toast.success("✅ Thiết bị đã bị khóa");
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.devices.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Unblock device
 */
export function useUnblockDeviceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) =>
      adminClient.post(`/admin/sessions/devices/${deviceId}/unblock`),
    onSuccess: () => {
      toast.success("✅ Thiết bị đã được mở khóa");
      void qc.invalidateQueries({ queryKey: sessionsAdminKeys.devices.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Export session data
 */
export function useExportSessionsMutation() {
  return useMutation({
    mutationFn: () =>
      adminClient.post<{ downloadUrl: string }>("/admin/sessions/export"),
    onSuccess: (response) => {
      toast.success("✅ Dữ liệu phiên đã sẵn sàng tải xuống");
      if (response.downloadUrl) {
        window.location.href = response.downloadUrl;
      }
    },
    onError: handleApiError,
  });
}
