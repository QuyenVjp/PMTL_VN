import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberClient } from "@/lib/api/member-client";
import { vowsMeritKeys } from "./query-keys";
import type { MemberVow } from "./queries";

// ─── Vows ─────────────────────────────────────────────────────────────────────

interface CreateVowInput {
  vowType: "LIFE_RELEASE" | "CHANTING" | "SUTRA_READING" | "CUSTOM";
  description: string;
  targetCount?: number;
  startDate: string;
  endDate?: string;
}

export function useCreateVow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVowInput) =>
      memberClient.post<MemberVow>("/me/vows", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vowsMeritKeys.vows() });
    },
  });
}

interface UpdateVowProgressInput {
  publicId: string;
  addCount: number;
  note?: string;
}

export function useUpdateVowProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateVowProgressInput) =>
      memberClient.post<MemberVow>("/me/vows/progress", input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: vowsMeritKeys.vows() });
      qc.setQueryData(vowsMeritKeys.vowById(data.publicId), data);
    },
  });
}

interface FulfillVowInput {
  publicId: string;
}

export function useFulfillVow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FulfillVowInput) =>
      memberClient.post<MemberVow>("/me/vows/fulfill", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vowsMeritKeys.vows() });
    },
  });
}

interface AddMeritTransferInput {
  vowPublicId: string;
  transferPercent: number;
  targetLabel: string;
  note?: string;
}

export function useAddMeritTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddMeritTransferInput) =>
      memberClient.post<MemberVow>("/me/vows/merit-transfer", input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: vowsMeritKeys.vowById(data.publicId) });
    },
  });
}

// ─── Altar ────────────────────────────────────────────────────────────────────

interface CreateAltarLogInput {
  actionType: "INCENSE" | "MAINTENANCE" | "MOVE" | "HEART_INCENSE";
  checklistState?: Record<string, boolean>;
  note?: string;
  date?: string;
}

export function useCreateAltarLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAltarLogInput) =>
      memberClient.post("/me/altar", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vowsMeritKeys.altar() });
    },
  });
}
