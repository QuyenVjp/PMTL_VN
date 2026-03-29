import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { assistedEntryKeys } from "./queries.js";

// ── Inputs ──────────────────────────────────────────────────────────

interface CreateVowInput {
  memberPublicId: string;
  vowType: string;
  description: string;
  targetCount?: number;
  startDate: string;
  assistReason: string;
}

interface CreateLifeReleaseInput {
  memberPublicId: string;
  animalType: string;
  quantity: number;
  location: string;
  note?: string;
  journalDate: string;
  assistReason: string;
}

// ── Mutations ───────────────────────────────────────────────────────

export function useCreateVow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVowInput) =>
      adminClient.post("/admin/vows/assisted-entry", input),
    onSuccess: () => {
      toast.success("Đã tạo phiếu phát nguyện.");
      void qc.invalidateQueries({ queryKey: assistedEntryKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function useCreateLifeReleaseJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLifeReleaseInput) =>
      adminClient.post("/admin/vows/assisted-entry/life-release", input),
    onSuccess: () => {
      toast.success("Đã tạo phiếu phóng sanh.");
      void qc.invalidateQueries({ queryKey: assistedEntryKeys.lists() });
    },
    onError: handleApiError,
  });
}
