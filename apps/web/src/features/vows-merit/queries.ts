import { queryOptions } from "@tanstack/react-query";
import { memberClient } from "@/lib/api/member-client";
import { vowsMeritKeys } from "./query-keys";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MemberVow {
  id: string;
  publicId: string;
  vowType: "LIFE_RELEASE" | "CHANTING" | "SUTRA_READING" | "CUSTOM";
  description: string;
  targetCount?: number | null;
  currentCount: number;
  progressPercent: number;
  status: "ACTIVE" | "COMPLETED" | "VOIDED";
  startDate: string;
  endDate?: string | null;
  totalTransferPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface AltarLog {
  id: string;
  publicId: string;
  actionType: "INCENSE" | "MAINTENANCE" | "MOVE" | "HEART_INCENSE";
  checklistState: Record<string, boolean>;
  note?: string | null;
  date: string;
  createdAt: string;
}

// ─── Query Options ────────────────────────────────────────────────────────────

export function vowListOptions(params?: { status?: string; limit?: number; offset?: number }) {
  return queryOptions({
    queryKey: vowsMeritKeys.vowList(params),
    queryFn: () =>
      memberClient.get<MemberVow[]>("/me/vows", params as Record<string, string | number | boolean | undefined>),
  });
}

export function vowDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: vowsMeritKeys.vowById(publicId),
    queryFn: () => memberClient.get<MemberVow>(`/me/vows/${publicId}`),
  });
}

export function altarListOptions(params?: { actionType?: string; limit?: number; offset?: number }) {
  return queryOptions({
    queryKey: vowsMeritKeys.altarList(params),
    queryFn: () =>
      memberClient.get<AltarLog[]>("/me/altar", params as Record<string, string | number | boolean | undefined>),
  });
}
