import { queryOptions } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

export type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ScheduleRow = {
  publicId: string;
  name: string;
  description: string | null;
  difficulty: Difficulty;
  dailyMinutes: number;
  minRecitations: number;
  maxRecitations: number | null;
  status: Status;
  createdAt: string;
  _count?: { guidelines?: number; routines?: number };
};

export type GuidelineRow = {
  publicId: string;
  topic: string;
  guidance: string;
  importance: Importance;
  createdAt: string;
  schedule?: { publicId: string; name: string } | null;
};

export type RoutineRow = {
  publicId: string;
  dayNumber: number;
  scriptureSequence: string[];
  timing: string;
  notes: string | null;
  createdAt: string;
  schedule?: { publicId: string; name: string } | null;
};

export const dailyRecitationKeys = {
  all: ["admin-daily-recitation"] as const,
  lists: () => [...dailyRecitationKeys.all, "list"] as const,
  list: (owner: "schedules" | "guidelines" | "routines") => [...dailyRecitationKeys.lists(), owner] as const,
  details: () => [...dailyRecitationKeys.all, "detail"] as const,
  detail: (owner: string, publicId: string) => [...dailyRecitationKeys.details(), owner, publicId] as const,
  schedules: () => dailyRecitationKeys.list("schedules"),
  guidelines: () => dailyRecitationKeys.list("guidelines"),
  routines: () => dailyRecitationKeys.list("routines"),
};

export function listSchedulesOptions() {
  return queryOptions({
    queryKey: dailyRecitationKeys.schedules(),
    queryFn: () =>
      adminClient.get<ListEnvelope<ScheduleRow>>("/admin/daily-recitation/schedules", {
        page: 1,
        limit: 100,
      }),
  });
}

export function listGuidelinesOptions() {
  return queryOptions({
    queryKey: dailyRecitationKeys.guidelines(),
    queryFn: () =>
      adminClient.get<ListEnvelope<GuidelineRow>>("/admin/daily-recitation/guidelines", {
        page: 1,
        limit: 100,
      }),
  });
}

export function listRoutinesOptions() {
  return queryOptions({
    queryKey: dailyRecitationKeys.routines(),
    queryFn: () => adminClient.get<{ data: RoutineRow[] }>("/admin/daily-recitation/routines"),
  });
}
