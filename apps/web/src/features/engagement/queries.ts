import { queryOptions } from "@tanstack/react-query";
import { memberClient } from "@/lib/api/member-client";
import { engagementKeys } from "./query-keys";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DailyGongkeLog {
  id: string;
  date: string;
  coreCounts: Record<string, number>;
  busyMode: boolean;
  heartIncense: boolean;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RepentanceLog {
  id: string;
  date: string;
  count: number;
  privateNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LittleHouse {
  id: string;
  publicId: string;
  recipient: string;
  sheetsCount: number;
  specialCase: boolean;
  status: "DRAFT" | "SIGNED" | "CHANTED" | "BURNED";
  burnDate?: string | null;
  postBurnNote?: string | null;
  allowedNextStatuses: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PracticeProfile {
  id: string;
  elderlyMode: boolean;
  assistMode: boolean;
  fontSize?: string | null;
  assistContactRef?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivationLog {
  id: string;
  date: string;
  symptomTag: "PAIN" | "BAD_DREAM" | "FAMILY_CONFLICT" | "OTHER";
  note?: string | null;
  suggestedActions: string[];
  createdAt: string;
}

export interface MeritSummary {
  gongke: { totalSessions: number; last30Days: number };
  vows: { active: number; completed: number };
  littleHouse: { total: number; burned: number };
  repentance: { totalCount: number; last30Days: number };
}

// ─── Query Options ────────────────────────────────────────────────────────────

export function gongkeListOptions(params?: { month?: string; limit?: number; offset?: number }) {
  return queryOptions({
    queryKey: engagementKeys.gongkeList(params),
    queryFn: () =>
      memberClient.get<DailyGongkeLog[]>("/me/gongke", params as Record<string, string | number | boolean | undefined>),
  });
}

export function gongkeByDateOptions(date: string) {
  return queryOptions({
    queryKey: engagementKeys.gongkeByDate(date),
    queryFn: () => memberClient.get<DailyGongkeLog>(`/me/gongke/${date}`),
  });
}

export function repentanceListOptions(params?: { month?: string; limit?: number; offset?: number }) {
  return queryOptions({
    queryKey: engagementKeys.repentanceList(params),
    queryFn: () =>
      memberClient.get<RepentanceLog[]>("/me/repentance", params as Record<string, string | number | boolean | undefined>),
  });
}

export function repentanceByDateOptions(date: string) {
  return queryOptions({
    queryKey: engagementKeys.repentanceByDate(date),
    queryFn: () => memberClient.get<RepentanceLog>(`/me/repentance/${date}`),
  });
}

export function littleHouseListOptions(params?: { status?: string; limit?: number; offset?: number }) {
  return queryOptions({
    queryKey: engagementKeys.littleHouseList(params),
    queryFn: () =>
      memberClient.get<LittleHouse[]>("/me/little-house", params as Record<string, string | number | boolean | undefined>),
  });
}

export function littleHouseDetailOptions(publicId: string) {
  return queryOptions({
    queryKey: engagementKeys.littleHouseById(publicId),
    queryFn: () => memberClient.get<LittleHouse>(`/me/little-house/${publicId}`),
  });
}

export function practiceProfileOptions() {
  return queryOptions({
    queryKey: engagementKeys.practiceProfile(),
    queryFn: () => memberClient.get<PracticeProfile>("/me/practice-profile"),
  });
}

export function activationListOptions(params?: { limit?: number; offset?: number }) {
  return queryOptions({
    queryKey: engagementKeys.activationList(params),
    queryFn: () =>
      memberClient.get<ActivationLog[]>("/me/activation", params as Record<string, string | number | boolean | undefined>),
  });
}

export function meritSummaryOptions() {
  return queryOptions({
    queryKey: engagementKeys.meritSummary(),
    queryFn: () => memberClient.get<MeritSummary>("/me/dashboard/merit-summary"),
  });
}
