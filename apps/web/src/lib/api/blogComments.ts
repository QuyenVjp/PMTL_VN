// ─────────────────────────────────────────────────────────────
//  lib/api/blogComments.ts — Blog comment API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { cmsFetch } from '@/lib/cms'
import type { BlogCommentThread } from '@/types/cms'

export async function getBlogCommentsBySlug(
  slug: string,
  page = 1,
  pageSize = 20
): Promise<BlogCommentThread> {
  return cmsFetch<BlogCommentThread>(`/blog-comments/by-post/${encodeURIComponent(slug)}?page=${page}&pageSize=${pageSize}`, {
    noCache: true,
  })
}
