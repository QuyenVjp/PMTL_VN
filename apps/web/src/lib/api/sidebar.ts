// ─────────────────────────────────────────────────────────────
//  lib/api/sidebar.ts — Sidebar config API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { cachedCmsFetch } from '@/lib/cms/server-cache'
import { getLatestComments } from '@/lib/api/comments'
import type { CmsSingle, SidebarConfig, BlogComment } from '@/types/cms'

export async function getSidebarConfig(): Promise<SidebarConfig | null> {
  try {
    const res = await cachedCmsFetch<CmsSingle<SidebarConfig>>('/sidebar-config', {
      populate: {
        downloadLinks: true,
        socialLinks: true,
        qrImages: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
      },
    }, {
      profile: 'hours',
      tags: ['sidebar-config'],
    })
    return res.data
  } catch {
    return null
  }
}

export async function getSidebarLatestComments(limit = 5): Promise<BlogComment[]> {
  try {
    return await getLatestComments(limit)
  } catch {
    return []
  }
}
