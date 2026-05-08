import { queryOptions } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client.js";

export type LittleHouseGuideGroup = "BAT_DAU" | "TRI_TUNG" | "DOT_HAU_XU_LY" | "TRA_CUU" | "THUC_HANH";
export type LittleHouseStatus = "DRAFT" | "PUBLISHED";

export interface LittleHouseGuide {
  publicId: string;
  slug: string;
  title: string;
  summary: string;
  groupKey: LittleHouseGuideGroup;
  sourceReference: string;
  versionNote: string;
  warningNotes: string[];
  displayOrder: number;
  updatedAt: string;
}

export interface LittleHouseCaseVariant {
  publicId: string;
  name: string;
  summary: string;
  relatedGroup: LittleHouseGuideGroup;
  sourceReference: string;
  reviewNote: string;
  warningNotes: string[];
  displayOrder: number;
  updatedAt: string;
}

export interface LittleHouseFaq {
  publicId: string;
  question: string;
  answer: string;
  sourceReference: string;
  displayOrder: number;
  updatedAt: string;
}

export interface LittleHouseDownload {
  publicId: string;
  title: string;
  assetType: "PRINTABLE" | "GUIDE_PDF" | "IMAGE_COMPARE" | "CHECKLIST";
  fileName: string;
  displayOrder: number;
}

export interface LittleHouseOverview {
  publicId: string;
  slug: "ngoi-nha-nho";
  title: "Ngôi Nhà Nhỏ";
  status: LittleHouseStatus;
  updatedAt: string;
  updatedByLabel: string;
  boundarySummary: {
    differentFromSelfCultivation: string;
    differentFromDailyPractice: string;
    nonNegotiables: string[];
  };
  sourceReferences: string[];
  versionNotes: string[];
  guides: LittleHouseGuide[];
  caseVariants: LittleHouseCaseVariant[];
  faq: LittleHouseFaq[];
  downloads: LittleHouseDownload[];
}

export const littleHouseContentKeys = {
  all: ["admin-little-house-content"] as const,
  lists: () => [...littleHouseContentKeys.all, "list"] as const,
  list: (owner: "guides" | "case-variants" | "faq" | "downloads") => [...littleHouseContentKeys.lists(), owner] as const,
  details: () => [...littleHouseContentKeys.all, "detail"] as const,
  detail: (owner: "guide" | "case-variant" | "faq" | "download", publicId: string) =>
    [...littleHouseContentKeys.details(), owner, publicId] as const,
  overview: () => [...littleHouseContentKeys.all, "overview"] as const,
};

export function littleHouseOverviewOptions() {
  return queryOptions({
    queryKey: littleHouseContentKeys.overview(),
    queryFn: () => adminClient.get<LittleHouseOverview>("/admin/content/little-house/overview"),
  });
}
