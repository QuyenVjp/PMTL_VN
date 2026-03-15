// ─────────────────────────────────────────────────────────────
//  lib/api/settings.ts — Site Settings API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────

import { strapiFetch } from '@/lib/strapi'
import type { SiteSetting, StrapiSingle } from '@/types/strapi'

/** Fallback settings used when Strapi is unavailable or not configured */
export const DEFAULT_SETTINGS: SiteSetting = {
  id: 0,
  documentId: '',
  siteTitle: 'Pháp Môn Tâm Linh',
  siteDescription: 'Hộ trì Phật pháp, tu học tâm linh. Niệm kinh, phóng sinh, bạch thoại Phật pháp.',
  logo: null,
  socialLinks: {
    facebook: 'https://www.facebook.com/phapmontamlinh',
    youtube: 'https://www.youtube.com/@phapmontamlinh',
    zalo: 'https://zalo.me/phapmontamlinh',
  },
  contactEmail: 'contact@phapmontamlinh.vn',
  contactPhone: null,
  address: null,
  footerText: null,
  heroSlides: null,
  stats: null,
  phapBao: null,
  actionCards: null,
  featuredVideos: null,
  awards: null,
  gallerySlides: null,
  stickyBanner: null,
  createdAt: '',
  updatedAt: '',
}

/** Get site settings — returns fallback if Strapi unavailable */
export async function getSiteSettings(): Promise<SiteSetting> {
  try {
    const res = await strapiFetch<StrapiSingle<SiteSetting>>('/setting', {
      populate: ['logo', 'awards'],
      next: { revalidate: 3600, tags: ['settings'] }, // cache 1hr — rarely changes
    })
    return res.data ?? DEFAULT_SETTINGS
  } catch {
    // Graceful degradation — always return usable settings
    return DEFAULT_SETTINGS
  }
}
