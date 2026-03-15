// ─────────────────────────────────────────────────────────────
//  lib/api/archive.ts — Archive API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { cmsFetch } from '@/lib/cms'
import type { ArchiveYear, CmsList, BlogPost } from '@/types/cms'

export async function getArchiveIndex(): Promise<ArchiveYear[]> {
  const res = await cmsFetch<{ data: ArchiveYear[] }>('/blog-posts/archive-index', {
    noCache: false,
    next: { revalidate: 3600, tags: ['blog-posts'] },
  })
  return res.data
}

export async function getArchivePosts(
  year: number,
  month?: number,
  page = 1,
  pageSize = 12
): Promise<CmsList<BlogPost>> {
  const monthParam = month ? `&month=${month}` : ''
  return cmsFetch<CmsList<BlogPost>>(
    `/blog-posts/archive?year=${year}${monthParam}&page=${page}&pageSize=${pageSize}`,
    { noCache: false, next: { revalidate: 3600, tags: ['blog-posts'] } }
  )
}
