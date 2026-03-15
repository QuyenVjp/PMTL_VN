// ─────────────────────────────────────────────────────────────
//  lib/api/guides.ts — Hướng Dẫn Sơ Học & Kinh Bài Tập API
//  Server-side only — fetch from Strapi v5
// ─────────────────────────────────────────────────────────────

import { strapiFetch } from '@/lib/strapi'
import type { StrapiList, BeginnerGuide } from '@/types/strapi'

/**
 * Fetch danh sách hướng dẫn theo loại.
 * guide_type: 'so-hoc' | 'kinh-bai-tap'
 */
export async function getGuides(guideType: 'so-hoc' | 'kinh-bai-tap'): Promise<BeginnerGuide[]> {
  try {
    const res = await strapiFetch<StrapiList<BeginnerGuide>>('/beginner-guides', {
      filters: { guide_type: { $eq: guideType } },
      sort: ['step_number:asc', 'order:asc'],
      populate: ['images', 'attached_files', 'icon'],
      pagination: { page: 1, pageSize: 100 },
      next: { revalidate: 300, tags: [`guides-${guideType}`] },
    })
    return res.data ?? []
  } catch (err) {
    console.error(`[Guides] Failed to fetch ${guideType}:`, err)
    return []
  }
}

/** Fetch tất cả hướng dẫn sơ học */
export async function getBeginnerGuides(): Promise<BeginnerGuide[]> {
  return getGuides('so-hoc')
}

/** Fetch tất cả Kinh bài tập hằng ngày */
export async function getDailyRecitationSteps(): Promise<BeginnerGuide[]> {
  return getGuides('kinh-bai-tap')
}

/** Fetch một guide cụ thể theo documentId */
export async function getGuideById(documentId: string): Promise<BeginnerGuide | null> {
  try {
    const res = await strapiFetch<{ data: BeginnerGuide }>(`/beginner-guides/${documentId}`, {
      populate: ['images', 'attached_files', 'icon'],
      next: { revalidate: 300, tags: [`guide-${documentId}`] },
    })
    return res.data ?? null
  } catch {
    return null
  }
}


