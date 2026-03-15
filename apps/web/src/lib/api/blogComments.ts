// ─────────────────────────────────────────────────────────────
//  lib/api/blogComments.ts — Blog comment API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'
import type { BlogCommentThread } from '@/types/strapi'

export async function getBlogCommentsBySlug(
  slug: string,
  page = 1,
  pageSize = 20
): Promise<BlogCommentThread> {
  return strapiFetch<BlogCommentThread>(`/blog-comments/by-post/${encodeURIComponent(slug)}?page=${page}&pageSize=${pageSize}`, {
    noCache: true,
  })
}
