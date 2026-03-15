'use server'

import { getPosts, GetPostsOptions, getAllTags, getCategories } from '@/lib/api/blog'
import { isMeilisearchConfigured, searchBlogPostsViaMeilisearch } from '@/lib/meilisearch'
import { revalidatePath, unstable_cache } from 'next/cache'

/**
 * Search posts via Meilisearch (faster, typo-tolerant)
 * Falls back to Strapi if Meilisearch unavailable
 */
export async function searchPostsAndCategories(options: GetPostsOptions) {
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? 10

  try {
    if (!isMeilisearchConfigured()) {
      throw new Error('Meilisearch is not configured')
    }

    // Try Meilisearch first (fast, typo-tolerant)
    const res = await searchBlogPostsViaMeilisearch(options.search || '', {
      page: options.page,
      pageSize: options.pageSize,
      sort: options.sort,
      categorySlug: options.categorySlug,
      tagSlugs: options.tagSlugs,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
    })

    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  } catch (error) {
    console.warn('[Search] Meilisearch unavailable, falling back to Strapi:', error)

    // Fallback to Strapi database search if Meilisearch is down
    try {
      const res = await getPosts({ ...options, revalidate: 0 })
      return {
        data: res.data ?? [],
        meta: res.meta,
      }
    } catch (fallbackError) {
      console.error('[Search] Strapi fallback failed, returning empty result:', fallbackError)
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
}

export const fetchAllCategories = unstable_cache(
  async () => {
    return await getCategories()
  },
  ['all-categories'],
  { revalidate: 3600, tags: ['categories'] }
)

export const fetchAllTags = unstable_cache(
  async () => {
    return await getAllTags()
  },
  ['all-tags'],
  { revalidate: 3600, tags: ['blog-tags'] }
)

export async function incrementViewAction(documentId: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const strapiUrl = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')
    const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)

    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${strapiUrl}/api/blog-posts/${documentId}/view`, {
      method: 'POST',
      headers,
      cache: 'no-store',
    })
    return { success: res.ok, status: res.status }
  } catch (err) {
    console.error('[Action] Failed to increment view:', err)
    return { success: false, error: String(err) }
  }
}

export async function revalidateBlogPath(slug: string) {
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/blog')
}
