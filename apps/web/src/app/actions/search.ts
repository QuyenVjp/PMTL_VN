'use server'

import { getPosts, getAllTags, getCategories } from '@/lib/api/blog'
import { buildCMSUrl } from '@/lib/cms/client'
import { revalidatePath } from 'next/cache'
import { cachedCmsFetch } from '@/lib/cms/server-cache'
import type { SearchHit } from '@/lib/search/types'
import type { GetPostsOptions } from '@/lib/api/blog'

/**
 * Search posts via CMS-owned search endpoint.
 * Falls back to content listing if the search service is unavailable.
 */
export async function searchPostsAndCategories(options: GetPostsOptions) {
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? 10
  const normalizedSearch = options.search?.trim() ?? ''

  if (!normalizedSearch) {
    const res = await getPosts({ ...options, search: undefined, revalidate: 0 })
    return {
      data: res.data ?? [],
      meta: res.meta,
    }
  }

  try {
    const url = new URL(buildCMSUrl('/api/posts/search'))
    url.searchParams.set('q', normalizedSearch)
    url.searchParams.set('limit', String(pageSize))

    const res = await fetch(url, {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`CMS search failed with status ${res.status}`)
    }

    const payload = (await res.json()) as {
      hits?: SearchHit[]
      totalHits?: number
    }

    const hits = Array.isArray(payload.hits) ? payload.hits : []
    const total = typeof payload.totalHits === 'number' ? payload.totalHits : hits.length

    return {
      data: hits,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.max(1, Math.ceil(Math.max(total, hits.length) / pageSize)),
          total,
        },
      },
    }
  } catch (error) {
    console.warn('[Search] CMS search unavailable, falling back to content listing:', error)

    try {
      const res = await getPosts({ ...options, revalidate: 0 })
      return {
        data: res.data ?? [],
        meta: res.meta,
      }
    } catch (fallbackError) {
      console.error('[Search] CMS fallback failed, returning empty result:', fallbackError)
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

export async function fetchAllCategories() {
  return cachedCmsFetch<Awaited<ReturnType<typeof getCategories>>>('/categories', {}, {
    profile: 'hours',
    tags: ['categories'],
  })
}

export async function fetchAllTags() {
  return cachedCmsFetch<Awaited<ReturnType<typeof getAllTags>>>('/blog-tags', {}, {
    profile: 'hours',
    tags: ['blog-tags'],
  })
}

export async function incrementViewAction(documentId: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const cmsUrl = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')
    const token = process.env.PAYLOAD_API_TOKEN

    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${cmsUrl}/api/posts/${documentId}/view`, {
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
  await Promise.resolve()
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/blog')
}
