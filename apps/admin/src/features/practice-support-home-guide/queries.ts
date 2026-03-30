import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

// ── Types ───────────────────────────────────────────────────────────

export interface RuleItem {
  ruleCode: string;
  label: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

export interface VietnamHomePracticeGuide {
  publicId: string;
  slug: string;
  title: string;
  overview: string;
  homeAltarRules: RuleItem[];
  heartIncenseFallbackRules: RuleItem[];
  littleHouseDisciplineRules: RuleItem[];
  familyCoordinationRules: RuleItem[];
  sacredItemRules: RuleItem[];
  accidentalViolationRecovery: RuleItem[];
  vegetarianDisciplineRules: RuleItem[];
  officeNutritionNotes: string[];
  supplementalDietNotes: string[];
  complianceAndEthicsRules: RuleItem[];
  updatedAt: string;
}

interface DetailEnvelope {
  data: VietnamHomePracticeGuide;
}

// ── Query Keys ──────────────────────────────────────────────────────

export const practiceHomeGuideKeys = {
  all: ["admin-practice-support-home-guide"] as const,
  detail: () => [...practiceHomeGuideKeys.all, "detail"] as const,
};

// ── Query Options ───────────────────────────────────────────────────

export function practiceHomeGuideDetailOptions() {
  return queryOptions({
    queryKey: practiceHomeGuideKeys.detail(),
    queryFn: () =>
      adminClient.get<DetailEnvelope>("/admin/content/practice-support/vietnam-home-practice-guide"),
  });
}
