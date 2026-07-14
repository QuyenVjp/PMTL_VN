import type { PracticeGuide, ScenarioPreset, PracticeFaq } from "../../../generated/prisma/client.js";
import type { GuideResponse, PresetResponse, FaqResponse } from "./daily-practice.schemas.js";

type GuideWithMedia = PracticeGuide & {
  scriptureImageMedia?: { publicId: string; url: string } | null;
};

/**
 * Map a PracticeGuide row → GuideResponse.
 * - publicId exposed as both `id` and `publicId`
 * - internal cuid `id` and FK `scriptureImageMediaId` are NEVER exposed
 * - dates as ISO strings
 * - scriptureImageUrl is resolved externally and passed in
 */
export function mapGuideToResponse(
  guide: GuideWithMedia,
  scriptureImageUrl: string | null,
): GuideResponse {
  const media = guide.scriptureImageMedia ?? null;
  return {
    id: guide.publicId,
    publicId: guide.publicId,
    title: guide.title,
    slug: guide.slug,
    body: guide.body,
    scriptureImageMediaPublicId: media?.publicId ?? null,
    scriptureImageUrl,
    duration: guide.duration,
    difficulty: guide.difficulty,
    status: guide.status,
    sortOrder: guide.sortOrder,
    publishedAt: guide.publishedAt?.toISOString() ?? null,
    createdAt: guide.createdAt.toISOString(),
    updatedAt: guide.updatedAt.toISOString(),
  };
}

/**
 * Map a ScenarioPreset row → PresetResponse.
 * - publicId exposed as both `id` and `publicId`
 * - internal cuid `id` is NEVER exposed
 * - dates as ISO strings
 */
export function mapPresetToResponse(preset: ScenarioPreset): PresetResponse {
  return {
    id: preset.publicId,
    publicId: preset.publicId,
    name: preset.name,
    scenarioType: preset.scenarioType,
    practiceCount: preset.practiceCount,
    guideIds: preset.guideIds,
    createdAt: preset.createdAt.toISOString(),
    updatedAt: preset.updatedAt.toISOString(),
  };
}

/**
 * Map a PracticeFaq row → FaqResponse.
 * - publicId exposed as both `id` and `publicId`
 * - internal cuid `id` is NEVER exposed
 * - dates as ISO strings
 */
export function mapFaqToResponse(faq: PracticeFaq): FaqResponse {
  return {
    id: faq.publicId,
    publicId: faq.publicId,
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    featured: faq.featured,
    sortOrder: faq.sortOrder,
    createdAt: faq.createdAt.toISOString(),
    updatedAt: faq.updatedAt.toISOString(),
  };
}
