// ─────────────────────────────────────────────────────────────
//  lib/api/series.ts — Series API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'
import type { SeriesData } from '@/types/strapi'

export async function getSeriesData(seriesKey: string, currentSlug: string): Promise<SeriesData | null> {
  try {
    return await strapiFetch<SeriesData>(
      `/blog-posts/series/${encodeURIComponent(seriesKey)}?currentSlug=${encodeURIComponent(currentSlug)}`,
      { noCache: false, next: { revalidate: 3600, tags: ['blog-posts'] } }
    )
  } catch {
    return null
  }
}
