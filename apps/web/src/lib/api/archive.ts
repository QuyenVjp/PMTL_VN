// ─────────────────────────────────────────────────────────────
//  lib/api/archive.ts — Archive API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'
import type { ArchiveYear, StrapiList, BlogPost } from '@/types/strapi'

export async function getArchiveIndex(): Promise<ArchiveYear[]> {
  const res = await strapiFetch<{ data: ArchiveYear[] }>('/blog-posts/archive-index', {
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
): Promise<StrapiList<BlogPost>> {
  const monthParam = month ? `&month=${month}` : ''
  return strapiFetch<StrapiList<BlogPost>>(
    `/blog-posts/archive?year=${year}${monthParam}&page=${page}&pageSize=${pageSize}`,
    { noCache: false, next: { revalidate: 3600, tags: ['blog-posts'] } }
  )
}
