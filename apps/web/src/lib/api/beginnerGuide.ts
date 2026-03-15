// ─────────────────────────────────────────────────────────────
//  lib/api/beginnerGuide.ts — API functions for Beginner Guide
// ─────────────────────────────────────────────────────────────

import { strapiFetch } from '@/lib/strapi'
import type { StrapiList, BeginnerGuide } from '@/types/strapi'

export async function getBeginnerGuides(): Promise<BeginnerGuide[]> {
  try {
    const result = await strapiFetch<StrapiList<BeginnerGuide>>('/beginner-guides', {
      sort: ['order:asc', 'createdAt:asc'],
      populate: ['images', 'icon'],
      pagination: { pageSize: 100 }, // get all
      next: { revalidate: 60, tags: ['beginner-guides'] },
    })

    return result.data ?? []
  } catch (err) {
    console.error('[API] Failed to fetch beginner guides:', err)
    return []
  }
}
