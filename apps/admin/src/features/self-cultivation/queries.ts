import { queryOptions } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client.js";

export type SelfCultivationGuideGroup = "BAT_DAU" | "CACH_DUNG" | "BAO_QUAN" | "TRUONG_HOP_SU_DUNG" | "TAI_XUONG";
export type SelfCultivationStatus = "DRAFT" | "PUBLISHED";

export interface SelfCultivationGuide {
  publicId: string;
  slug: string;
  title: string;
  summary: string;
  groupKey: SelfCultivationGuideGroup;
  sourceReference: string;
  boundaryNote?: string;
  warningNotes: string[];
  displayOrder: number;
  updatedAt: string;
}

export interface SelfCultivationFaq {
  publicId: string;
  question: string;
  answer: string;
  sourceReference: string;
  displayOrder: number;
  updatedAt: string;
}

export interface SelfCultivationDownload {
  publicId: string;
  title: string;
  assetType: "PRINTABLE" | "GUIDE_PDF" | "BANG_PHAN_BIET";
  fileName: string;
  displayOrder: number;
}

export interface SelfCultivationOverview {
  publicId: string;
  slug: "kinh-van-tu-tu";
  title: "Kinh văn tự tu";
  status: SelfCultivationStatus;
  updatedAt: string;
  updatedByLabel: string;
  boundarySummary: {
    differentFromDailyPractice: string;
    differentFromLittleHouse: string;
    nonNegotiables: string[];
  };
  sourceReferences: string[];
  versionNotes: string[];
  guides: SelfCultivationGuide[];
  faq: SelfCultivationFaq[];
  downloads: SelfCultivationDownload[];
}

export const selfCultivationKeys = {
  all: ["admin-self-cultivation"] as const,
  overview: () => [...selfCultivationKeys.all, "overview"] as const,
};

export function selfCultivationOverviewOptions() {
  return queryOptions({
    queryKey: selfCultivationKeys.overview(),
    queryFn: () => adminClient.get<SelfCultivationOverview>("/admin/content/self-cultivation/overview"),
  });
}
