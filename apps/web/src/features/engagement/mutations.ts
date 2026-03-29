import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberClient } from "@/lib/api/member-client";
import { engagementKeys } from "./query-keys";
import type { DailyGongkeLog, RepentanceLog, LittleHouse, PracticeProfile, ActivationLog } from "./queries";

// ─── Gongke ──────────────────────────────────────────────────────────────────

interface UpsertGongkeInput {
  date: string;
  coreCounts: Record<string, number>;
  busyMode?: boolean;
  heartIncense?: boolean;
  note?: string;
}

export function useUpsertGongke() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertGongkeInput) =>
      memberClient.post<DailyGongkeLog>("/me/gongke", input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: engagementKeys.gongke() });
      qc.setQueryData(engagementKeys.gongkeByDate(data.date), data);
    },
  });
}

// ─── Repentance ───────────────────────────────────────────────────────────────

interface UpsertRepentanceInput {
  date: string;
  count: number;
  privateNote?: string;
}

export function useUpsertRepentance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertRepentanceInput) =>
      memberClient.post<RepentanceLog>("/me/repentance", input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: engagementKeys.repentance() });
      qc.setQueryData(engagementKeys.repentanceByDate(data.date), data);
    },
  });
}

// ─── Little House ─────────────────────────────────────────────────────────────

interface CreateLittleHouseInput {
  recipient: string;
  sheetsCount?: number;
  specialCase?: boolean;
}

export function useCreateLittleHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLittleHouseInput) =>
      memberClient.post<LittleHouse>("/me/little-house", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: engagementKeys.littleHouse() });
    },
  });
}

interface AdvanceLittleHouseInput {
  publicId: string;
  nextStatus: "SIGNED" | "CHANTED" | "BURNED";
  burnDate?: string;
  postBurnNote?: string;
  specialCaseConfirmed?: boolean;
}

export function useAdvanceLittleHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdvanceLittleHouseInput) =>
      memberClient.post<LittleHouse>("/me/little-house/advance", input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: engagementKeys.littleHouse() });
      qc.setQueryData(engagementKeys.littleHouseById(data.publicId), data);
    },
  });
}

// ─── Practice Profile ─────────────────────────────────────────────────────────

interface UpdatePracticeProfileInput {
  elderlyMode?: boolean;
  assistMode?: boolean;
  fontSize?: string;
  assistContactRef?: string;
}

export function useUpdatePracticeProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePracticeProfileInput) =>
      memberClient.put<PracticeProfile>("/me/practice-profile", input),
    onSuccess: (data) => {
      qc.setQueryData(engagementKeys.practiceProfile(), data);
    },
  });
}

// ─── Activation Log ───────────────────────────────────────────────────────────

interface CreateActivationLogInput {
  date: string;
  symptomTag: "PAIN" | "BAD_DREAM" | "FAMILY_CONFLICT" | "OTHER";
  note?: string;
}

export function useCreateActivationLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActivationLogInput) =>
      memberClient.post<ActivationLog>("/me/activation", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: engagementKeys.activation() });
    },
  });
}
