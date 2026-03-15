// ─────────────────────────────────────────────────────────────
//  lib/api/blog-tags.ts — BlogTag API helpers
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────

import { strapiFetch } from '@/lib/strapi'
import type { BlogTag, StrapiList } from '@/types/strapi'

/** Fetch a single tag by slug — returns null if not found */
export async function fetchTagBySlug(slug: string): Promise<BlogTag | null> {
  const res = await strapiFetch<StrapiList<BlogTag>>('/blog-tags', {
    filters: { slug: { $eq: slug } },
    pagination: { pageSize: 1 },
    next: { tags: ['blog-tags'], revalidate: 3600 },
  })
  return res.data?.[0] ?? null
}

/** Fetch all tag slugs for static path generation */
export async function getAllTagSlugs(): Promise<string[]> {
  const res = await strapiFetch<StrapiList<Pick<BlogTag, 'slug'>>>('/blog-tags', {
    fields: ['slug'],
    pagination: { pageSize: 200 },
    next: { tags: ['blog-tags'], revalidate: 3600 },
  })
  return res.data?.map((t) => t.slug) ?? []
}
