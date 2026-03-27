import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { EnvironmentRulesPage } from "./page-content";
import { getServerApiBaseUrl } from "../../../lib/api-base";

export const metadata: Metadata = {
  title: "Lưu ý môi trường và thời gian niệm kinh",
  description:
    "Hướng dẫn về thời gian, địa điểm, và các điều kiện phù hợp để thực hành niệm kinh đạt hiệu quả cao nhất.",
  openGraph: {
    title: "Lưu ý môi trường và thời gian niệm kinh | PMTL",
    description:
      "Hướng dẫn về thời gian, địa điểm, và các điều kiện phù hợp để thực hành niệm kinh.",
  },
};

interface EnvironmentRulesData {
  intro: {
    title: string;
    summary: string;
    updatedAt: string;
  };
  groupCards: Array<{
    groupKey: string;
    title: string;
    summary: string;
    ruleCount: number;
  }>;
  groups: Array<{
    groupKey: string;
    title: string;
    summary: string;
    severityLegend: Array<{
      severity: string;
      label: string;
      description: string;
    }>;
    rules: Array<{
      ruleKey: string;
      title: string;
      canonicalWording: string;
      severity: string;
      productizationMode: string;
      safeLaneRefs?: string[];
      avoidItems?: string[];
      shortReason: string | null;
      referenceOnly: boolean;
    }>;
    lastReviewedAt: string;
    versionNote: string | null;
  }>;
  quickChecklist: {
    beforeYouStart: string[];
    whenToPause: string[];
    safeLaneSuggestions: string[];
  };
  specialLocationHighlights: Array<{
    topic: string;
    summary: string;
  }>;
  referenceOnlyCautions: Array<{
    topic: string;
    summary: string;
    ctaLabel: string;
    ctaHref: string;
  }>;
  relatedGuideRefs: Array<{
    title: string;
    href: string;
    surface: string;
  }>;
}

async function getEnvironmentRulesData(): Promise<EnvironmentRulesData | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("content:chanting-environment-rules");

  const apiBaseUrl = getServerApiBaseUrl();

  if (!apiBaseUrl) {
    return null;
  }

  try {
    const res = await fetch(`${apiBaseUrl}/content/chanting/environment-rules`);

    if (!res.ok) {
      console.error(`API returned ${res.status}`);
      return null;
    }

    const data = (await res.json()) as EnvironmentRulesData;
    return data;
  } catch (error) {
    console.error("Failed to fetch environment rules:", error);
    return null;
  }
}

export default async function Page() {
  const data = await getEnvironmentRulesData();

  if (!data) {
    notFound();
  }

  return <EnvironmentRulesPage data={data} />;
}
