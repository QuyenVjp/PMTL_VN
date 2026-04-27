import { queryOptions } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client.js";

export type LifeReleaseGuideGroup = "NGHI_THUC" | "LUU_Y_CHUAN_BI" | "HOI_DAP";
export type LifeReleaseStatus = "DRAFT" | "PUBLISHED";

export interface LifeReleaseGuide {
  publicId: string;
  slug: string;
  title: string;
  summary: string;
  groupKey: LifeReleaseGuideGroup;
  sourceReference: string;
  reviewNote: string;
  warningNotes: string[];
  displayOrder: number;
  updatedAt: string;
}

export interface LifeReleaseVariant {
  publicId: string;
  name: string;
  summary: string;
  routeSlug: string;
  sourceReference: string;
  reviewNote: string;
  warningNotes: string[];
  displayOrder: number;
  updatedAt: string;
}

export interface LifeReleaseFaq {
  publicId: string;
  question: string;
  answer: string;
  sourceReference: string;
  displayOrder: number;
  updatedAt: string;
}

export interface LifeReleaseDownload {
  publicId: string;
  title: string;
  assetType: "GUIDE_PDF" | "CHECKLIST" | "PRAYER_CARD";
  fileName: string;
  displayOrder: number;
}

export interface LifeReleaseOverview {
  publicId: string;
  slug: "phong-sanh";
  title: "Phóng sanh";
  status: LifeReleaseStatus;
  updatedAt: string;
  updatedByLabel: string;
  boundarySummary: {
    differentFromJournal: string;
    differentFromCalendar: string;
    nonNegotiables: string[];
  };
  sourceReferences: string[];
  versionNotes: string[];
  guides: LifeReleaseGuide[];
  ritualVariants: LifeReleaseVariant[];
  faq: LifeReleaseFaq[];
  downloads: LifeReleaseDownload[];
}

export const lifeReleaseContentKeys = {
  all: ["admin-life-release-content"] as const,
  overview: () => [...lifeReleaseContentKeys.all, "overview"] as const,
};

export function lifeReleaseOverviewOptions() {
  return queryOptions({
    queryKey: lifeReleaseContentKeys.overview(),
    queryFn: () => adminClient.get<LifeReleaseOverview>("/admin/content/life-release/overview"),
  });
}
