/**
 * SCAFFOLD — mutations.ts
 *
 * Replace [Feature] / [feature] / [features] / [domain] throughout.
 * Rules:
 *   - Always call handleApiError in onError
 *   - Always invalidate after success — never optimistic update
 *   - Vietnamese toast messages with full diacritics
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { [feature]Keys } from "./queries.js";

// ── Input types ───────────────────────────────────────────────────────

interface Create[Feature]Input {
  title: string;
  // Add remaining create fields
}

interface Update[Feature]Input {
  publicId: string;
  title?: string;
  // Add remaining update fields
}

// ── Create ────────────────────────────────────────────────────────────

export function useCreate[Feature]() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Create[Feature]Input) =>
      adminClient.post("/admin/[domain]/[features]", input),
    onSuccess: () => {
      toast.success("Đã tạo thành công.");
      void qc.invalidateQueries({ queryKey: [feature]Keys.lists() });
    },
    onError: handleApiError,
  });
}

// ── Update ────────────────────────────────────────────────────────────

export function useUpdate[Feature]() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Update[Feature]Input) =>
      adminClient.patch(`/admin/[domain]/[features]/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("Đã cập nhật.");
      void qc.invalidateQueries({ queryKey: [feature]Keys.lists() });
      void qc.invalidateQueries({ queryKey: [feature]Keys.detail(publicId) });
    },
    onError: handleApiError,
  });
}

// ── Delete ────────────────────────────────────────────────────────────

export function useDelete[Feature]() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/[domain]/[features]/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá.");
      void qc.invalidateQueries({ queryKey: [feature]Keys.lists() });
    },
    onError: handleApiError,
  });
}

// ── Publish (remove if feature has no publish workflow) ───────────────

export function usePublish[Feature]() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/[domain]/[features]/${publicId}/publish`),
    onSuccess: () => {
      toast.success("Đã xuất bản.");
      void qc.invalidateQueries({ queryKey: [feature]Keys.lists() });
    },
    onError: handleApiError,
  });
}

// ── Unpublish (uses PATCH if no dedicated endpoint) ───────────────────

export function useUnpublish[Feature]() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.patch(`/admin/[domain]/[features]/${publicId}`, { status: "DRAFT" }),
    onSuccess: (_data, publicId) => {
      toast.success("Đã gỡ xuất bản.");
      void qc.invalidateQueries({ queryKey: [feature]Keys.lists() });
      void qc.invalidateQueries({ queryKey: [feature]Keys.detail(publicId) });
    },
    onError: handleApiError,
  });
}
