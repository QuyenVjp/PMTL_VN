// ─────────────────────────────────────────────────────────────
//  lib/api/beginnerGuide.ts — API functions for Beginner Guide
// ─────────────────────────────────────────────────────────────

import { cachedCmsFetch } from '@/lib/cms/server-cache'
import type { CmsList, BeginnerGuide } from '@/types/cms'

export async function getBeginnerGuides(): Promise<BeginnerGuide[]> {
  try {
    const result = await cachedCmsFetch<CmsList<BeginnerGuide>>('/guides', {
      sort: ['order:asc', 'createdAt:asc'],
      populate: ['images', 'icon'],
      pagination: { pageSize: 100 }, // get all
    }, { profile: 'minutes', tags: ['guides'] })

    return result.data ?? []
  } catch (err) {
    console.error('[API] Failed to fetch beginner guides:', err)
    return []
  }
}
