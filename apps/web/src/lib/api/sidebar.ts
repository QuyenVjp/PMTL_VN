// ─────────────────────────────────────────────────────────────
//  lib/api/sidebar.ts — Sidebar config API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'
import type { StrapiSingle, SidebarConfig, BlogCommentThread } from '@/types/strapi'

export async function getSidebarConfig(): Promise<SidebarConfig | null> {
  try {
    const res = await strapiFetch<StrapiSingle<SidebarConfig>>('/sidebar-config', {
      populate: {
        downloadLinks: true,
        socialLinks: true,
        qrImages: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
      },
      next: { revalidate: 3600, tags: ['sidebar-config'] },
    })
    return res.data
  } catch {
    return null
  }
}

export async function getSidebarLatestComments(limit = 5): Promise<BlogCommentThread['data']> {
  try {
    // Fetch the most-recently approved top-level comments across all posts
    const res = await strapiFetch<BlogCommentThread>(
      `/blog-comments/latest?limit=${limit}`,
      { noCache: true }
    )
    return res.data ?? []
  } catch {
    return []
  }
}
