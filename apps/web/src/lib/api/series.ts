// ─────────────────────────────────────────────────────────────
//  lib/api/series.ts — Series API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { cmsFetch } from '@/lib/cms'
import type { SeriesData } from '@/types/cms'

export async function getSeriesData(seriesKey: string, currentSlug: string): Promise<SeriesData | null> {
  try {
    return await cmsFetch<SeriesData>(
      `/blog-posts/series/${encodeURIComponent(seriesKey)}?currentSlug=${encodeURIComponent(currentSlug)}`,
      { noCache: false, next: { revalidate: 3600, tags: ['blog-posts'] } }
    )
  } catch {
    return null
  }
}
