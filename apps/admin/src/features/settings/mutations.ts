import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client";
import { clearAuthCache } from "@/lib/auth";
import { buildCsrfHeader } from "@/lib/csrf";
import { handleApiError } from "@/lib/handle-api-error";
import { currentUserQueryKey } from "@/lib/query/use-current-user";
import type { UserRole } from "@/lib/roles";

interface UploadResponse {
  publicId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface ProfileResponse {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string | null;
}

interface SaveProfileInput {
  displayName: string;
  avatarFile?: File | null;
}

interface SaveProfileResult {
  profile: ProfileResponse;
  avatarUrl?: string;
}

async function uploadAvatar(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    headers: buildCsrfHeader("POST"),
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const errJson: unknown = await response.json().catch(() => null);
    const errObj = errJson as Record<string, unknown> | null;
    const errInner = (errObj?.error ?? null) as Record<string, unknown> | null;
    const message = typeof errInner?.message === "string" ? errInner.message : "Upload thất bại";
    throw new Error(message);
  }

  const json = (await response.json()) as {
    data?: UploadResponse | { data?: UploadResponse };
  };
  const outer = json.data;
  const payload: UploadResponse | null =
    outer && "url" in outer
      ? outer
      : outer && "data" in outer && outer.data
        ? outer.data
        : null;

  if (!payload?.url) {
    throw new Error("Upload thất bại: phản hồi không hợp lệ");
  }

  return payload;
}

export function useSaveAdminProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, avatarFile }: SaveProfileInput): Promise<SaveProfileResult> => {
      const uploaded = avatarFile ? await uploadAvatar(avatarFile) : null;
      const profile = await adminClient.patch<ProfileResponse>("/auth/profile", {
        displayName,
        ...(uploaded ? { avatarUrl: uploaded.url } : {}),
      });

      return {
        profile,
        avatarUrl: uploaded?.url,
      };
    },
    onSuccess: async () => {
      clearAuthCache();
      await queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
      toast.success("Đã cập nhật hồ sơ thành công");
    },
    onError: handleApiError,
  });
}

export function useRevokeOtherSessions() {
  return useMutation({
    mutationFn: () => adminClient.post("/auth/logout-all"),
    onSuccess: () => {
      clearAuthCache();
      toast.success("Đã thu hồi toàn bộ phiên đăng nhập khác.");
    },
    onError: handleApiError,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      adminClient.post("/auth/change-password", input),
    onSuccess: () => {
      toast.success("Đã đổi mật khẩu.");
    },
    onError: handleApiError,
  });
}
