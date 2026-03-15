// ─────────────────────────────────────────────────────────────
//  lib/api/settings.ts — Site Settings API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────

import { cmsGet } from "@/lib/cms/client";
import type { SiteSetting } from "@/types/cms";

/** Fallback settings used when CMS is unavailable or not configured */
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

/** Get site settings — returns fallback if CMS unavailable */
export async function getSiteSettings(): Promise<SiteSetting> {
  try {
    const document = await cmsGet<SiteSetting>("/api/site-settings", {
      cache: "force-cache",
    });

    return document ?? DEFAULT_SETTINGS;
  } catch {
    // Graceful degradation — always return usable settings
    return DEFAULT_SETTINGS
  }
}
