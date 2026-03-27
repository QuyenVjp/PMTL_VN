import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { userAdminKeys } from "./queries.js";
import type { UpdateProfileInput, ChangeRoleInput, BlockUserInput } from "./types.js";

/** Update user profile (displayName, email, avatarUrl) */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input: UpdateProfileInput }) =>
      adminClient.patch(`/admin/users/${publicId}/profile`, input),
    onSuccess: (_data, { publicId }) => {
      void qc.invalidateQueries({ queryKey: userAdminKeys.lists() });
      void qc.invalidateQueries({ queryKey: userAdminKeys.detail(publicId) });
    },
  });
}

/** Change user role */
export function useChangeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input: ChangeRoleInput }) =>
      adminClient.patch(`/admin/users/${publicId}/role`, input),
    onSuccess: (_data, { publicId }) => {
      void qc.invalidateQueries({ queryKey: userAdminKeys.lists() });
      void qc.invalidateQueries({ queryKey: userAdminKeys.detail(publicId) });
    },
  });
}

/** Block user (sets status to SUSPENDED, revokes all sessions) */
export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input?: BlockUserInput }) =>
      adminClient.post(`/admin/users/${publicId}/block`, input),
    onSuccess: (_data, { publicId }) => {
      void qc.invalidateQueries({ queryKey: userAdminKeys.lists() });
      void qc.invalidateQueries({ queryKey: userAdminKeys.detail(publicId) });
    },
  });
}

/** Unblock user (sets status back to ACTIVE) */
export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId }: { publicId: string }) =>
      adminClient.post(`/admin/users/${publicId}/unblock`),
    onSuccess: (_data, { publicId }) => {
      void qc.invalidateQueries({ queryKey: userAdminKeys.lists() });
      void qc.invalidateQueries({ queryKey: userAdminKeys.detail(publicId) });
    },
  });
}

/** Revoke all sessions for a user */
export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId }: { publicId: string }) =>
      adminClient.post(`/admin/users/${publicId}/sessions/revoke-all`),
    onSuccess: (_data, { publicId }) => {
      void qc.invalidateQueries({ queryKey: userAdminKeys.detail(publicId) });
    },
  });
}
