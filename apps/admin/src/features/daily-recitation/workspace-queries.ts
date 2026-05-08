import { queryOptions } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

export type DailyPracticeStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type DailyPracticeDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface DailyPracticeOverview {
  guides: { total: number; published: number };
  presets: { total: number };
  faqs: { total: number };
}

export interface DailyPracticeGuide {
  publicId: string;
  title: string;
  slug: string;
  body: string;
  scriptureImageMediaPublicId: string | null;
  scriptureImageUrl: string | null;
  duration: number;
  difficulty: DailyPracticeDifficulty;
  status: DailyPracticeStatus;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyPracticePreset {
  publicId: string;
  name: string;
  scenarioType: string;
  practiceCount: number;
  guideIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyPracticeFaq {
  publicId: string;
  question: string;
  answer: string;
  category: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const dailyPracticeWorkspaceKeys = {
  all: ["admin-daily-practice-workspace"] as const,
  overview: () => [...dailyPracticeWorkspaceKeys.all, "overview"] as const,
  lists: () => [...dailyPracticeWorkspaceKeys.all, "list"] as const,
  list: (owner: "guides" | "presets" | "faq") => [...dailyPracticeWorkspaceKeys.lists(), owner] as const,
  details: () => [...dailyPracticeWorkspaceKeys.all, "detail"] as const,
  detail: (owner: "guide" | "preset" | "faq", publicId: string) =>
    [...dailyPracticeWorkspaceKeys.details(), owner, publicId] as const,
  guides: () => dailyPracticeWorkspaceKeys.list("guides"),
  guide: (publicId: string) => dailyPracticeWorkspaceKeys.detail("guide", publicId),
  presets: () => dailyPracticeWorkspaceKeys.list("presets"),
  preset: (publicId: string) => dailyPracticeWorkspaceKeys.detail("preset", publicId),
  faq: () => dailyPracticeWorkspaceKeys.list("faq"),
  faqItem: (publicId: string) => dailyPracticeWorkspaceKeys.detail("faq", publicId),
};

export function dailyPracticeOverviewOptions() {
  return queryOptions({
    queryKey: dailyPracticeWorkspaceKeys.overview(),
    queryFn: () => adminClient.get<DailyPracticeOverview>("/admin/daily-practice/overview"),
  });
}

export function dailyPracticeGuidesOptions() {
  return queryOptions({
    queryKey: dailyPracticeWorkspaceKeys.guides(),
    queryFn: () =>
      adminClient.get<ListEnvelope<DailyPracticeGuide>>("/admin/daily-practice/guides", {
        page: 1,
        limit: 100,
      }),
  });
}

export function dailyPracticeGuideOptions(publicId: string) {
  return queryOptions({
    queryKey: dailyPracticeWorkspaceKeys.guide(publicId),
    queryFn: () => adminClient.get<DailyPracticeGuide>(`/admin/daily-practice/guides/${publicId}`),
    enabled: Boolean(publicId),
  });
}

export function dailyPracticePresetsOptions() {
  return queryOptions({
    queryKey: dailyPracticeWorkspaceKeys.presets(),
    queryFn: () => adminClient.get<{ data: DailyPracticePreset[] }>("/admin/daily-practice/presets"),
  });
}

export function dailyPracticePresetOptions(publicId: string) {
  return queryOptions({
    queryKey: dailyPracticeWorkspaceKeys.preset(publicId),
    queryFn: () => adminClient.get<DailyPracticePreset>(`/admin/daily-practice/presets/${publicId}`),
    enabled: Boolean(publicId),
  });
}

export function dailyPracticeFaqOptions() {
  return queryOptions({
    queryKey: dailyPracticeWorkspaceKeys.faq(),
    queryFn: () => adminClient.get<{ data: DailyPracticeFaq[] }>("/admin/daily-practice/faq"),
  });
}

export function dailyPracticeFaqItemOptions(publicId: string) {
  return queryOptions({
    queryKey: dailyPracticeWorkspaceKeys.faqItem(publicId),
    queryFn: () => adminClient.get<DailyPracticeFaq>(`/admin/daily-practice/faq/${publicId}`),
    enabled: Boolean(publicId),
  });
}
