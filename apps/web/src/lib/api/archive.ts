// ─────────────────────────────────────────────────────────────
//  lib/api/archive.ts — Archive API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { cachedCmsFetch } from '@/lib/cms/server-cache'
import type { ArchiveYear, CmsList, BlogPost } from '@/types/cms'

export async function getArchiveIndex(): Promise<ArchiveYear[]> {
  try {
    const res = await cachedCmsFetch<{ data: ArchiveYear[] }>('/blog-posts/archive-index', {}, {
      profile: 'hours',
      tags: ['blog-posts'],
    })

    return res.data
  } catch {
    return []
  }
}

export async function getArchivePosts(
  year: number,
  month?: number,
  page = 1,
  pageSize = 12,
): Promise<CmsList<BlogPost>> {
  const monthParam = month ? `&month=${month}` : ''

  try {
    return await cachedCmsFetch<CmsList<BlogPost>>(
      `/blog-posts/archive?year=${year}${monthParam}&page=${page}&pageSize=${pageSize}`,
      {},
      { profile: 'hours', tags: ['blog-posts'] },
    )
  } catch {
    return {
      data: [],
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: 0,
          total: 0,
        },
      },
    }
  }
}
