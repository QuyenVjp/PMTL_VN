// ─────────────────────────────────────────────────────────────
//  lib/api/series.ts — Series API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { cachedCmsFetch } from '@/lib/cms/server-cache'
import type { SeriesData } from '@/types/cms'

export async function getSeriesData(seriesKey: string, currentSlug: string): Promise<SeriesData | null> {
  try {
    return await cachedCmsFetch<SeriesData>(
      `/blog-posts/series/${encodeURIComponent(seriesKey)}?currentSlug=${encodeURIComponent(currentSlug)}`,
      {},
      { profile: 'hours', tags: ['blog-posts'] }
    )
  } catch {
    return null
  }
}
