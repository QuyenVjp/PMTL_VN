// ─────────────────────────────────────────────────────────────
//  lib/api/blog.ts — BlogPost API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────

import { cmsFetch } from '@/lib/cms'
import { cachedCmsFetch } from '@/lib/cms/server-cache'
import { logger } from '@/lib/logger'
import type { BlogPost, CmsList, CmsSingle, Category, BlogTag } from '@/types/cms'

const POPULATE_FULL = ['thumbnail', 'gallery', 'seo', 'categories', 'tags']
const POPULATE_LIST = ['thumbnail', 'gallery', 'categories', 'tags']
const POPULATE_METADATA = ['thumbnail', 'seo']

export interface GetPostsOptions {
  page?: number
  pageSize?: number
  categorySlug?: string
  tagSlugs?: string[]
  search?: string
  source?: string
  featured?: boolean
  language?: 'vi' | 'zh'
  dateFrom?: string
  dateTo?: string
  sort?: 'relevance' | 'newest' | 'oldest' | 'most-viewed'
  revalidate?: number
  noCache?: boolean
}

async function fetchBlogData<T>(
  path: string,
  options: Parameters<typeof cmsFetch<T>>[1],
  cacheOptions: {
    profile?: ReturnType<typeof resolveCacheProfile>
    tags?: string[]
  },
): Promise<T> {
  if (options?.noCache) {
    return cmsFetch<T>(path, options)
  }

  return cachedCmsFetch<T>(path, options, cacheOptions)
}

function resolveCacheProfile(revalidate?: number) {
  if (!revalidate || revalidate <= 0) {
    return 'seconds' as const
  }

  if (revalidate <= 60) {
    return 'minutes' as const
  }

  if (revalidate <= 3600) {
    return 'hours' as const
  }

  if (revalidate <= 86400) {
    return 'days' as const
  }

  return 'weeks' as const
}

export async function getPosts(options: GetPostsOptions = {}): Promise<CmsList<BlogPost>> {
  const {
    page = 1,
    pageSize = 10,
    categorySlug,
    tagSlugs,
    search,
    source,
    featured,
    language,
    dateFrom,
    dateTo,
    sort = 'relevance',
    revalidate = 3600,
  } = options

  const filters: Record<string, unknown> = {}

  if (search) {
    filters['$or'] = [
      { title: { $containsi: search } },
      { content: { $containsi: search } },
      { sourceName: { $containsi: search } },
      { sourceTitle: { $containsi: search } },
    ]
  }

  if (categorySlug) {
    filters['categories'] = { slug: { $eq: categorySlug } }
  }

  if (tagSlugs?.length) {
    filters['tags'] = { slug: { $in: tagSlugs } }
  }

  if (source) {
    filters['sourceName'] = { $containsi: source }
  }

  if (featured !== undefined) {
    filters['featured'] = { $eq: featured }
  }

  if (language) {
    filters['language'] = { $eq: language }
  }

  if (dateFrom || dateTo) {
    const publishedAtFilter: Record<string, string> = {}
    if (dateFrom) publishedAtFilter['$gte'] = dateFrom
    if (dateTo) publishedAtFilter['$lte'] = dateTo
    filters['publishedAt'] = publishedAtFilter
  }

  const sortOrder =
    sort === 'oldest'
      ? ['publishedAt:asc']
      : sort === 'most-viewed'
        ? ['views:desc', 'publishedAt:desc']
        : ['publishedAt:desc']

  const noCache = options.noCache || revalidate === 0

  return fetchBlogData<CmsList<BlogPost>>(
    '/blog-posts',
    {
      sort: sortOrder,
      filters,
      pagination: { page, pageSize },
      populate: POPULATE_LIST,
      noCache,
    },
    {
      profile: resolveCacheProfile(revalidate),
      tags: ['blog-posts'],
    },
  )
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const res = await cachedCmsFetch<CmsList<BlogPost>>(
    '/blog-posts',
    {
      filters: { slug: { $eq: slug } },
      populate: POPULATE_FULL,
      pagination: { page: 1, pageSize: 1 },
    },
    {
      profile: 'hours',
      tags: [`blog-post-${slug}`],
    },
  )

  return res.data[0] ?? null
}

export async function getPostBySlugForMetadata(slug: string): Promise<BlogPost | null> {
  const res = await cachedCmsFetch<CmsList<BlogPost>>(
    '/blog-posts',
    {
      filters: { slug: { $eq: slug } },
      populate: POPULATE_METADATA,
      pagination: { page: 1, pageSize: 1 },
      fields: ['title', 'slug', 'content', 'publishedAt', 'createdAt'],
    },
    {
      profile: 'hours',
      tags: [`blog-post-seo-${slug}`],
    },
  )

  return res.data[0] ?? null
}

export async function getPostById(documentId: string): Promise<BlogPost | null> {
  try {
    const res = await cachedCmsFetch<CmsSingle<BlogPost>>(
      `/blog-posts/${documentId}`,
      {
        populate: POPULATE_FULL,
      },
      {
        profile: 'hours',
        tags: [`blog-post-${documentId}`],
      },
    )

    return res.data
  } catch {
    return null
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  const slugs: string[] = []
  let page = 1
  let pageCount = 1

  while (page <= pageCount) {
    const res = await cachedCmsFetch<CmsList<Pick<BlogPost, 'slug'>>>(
      '/blog-posts',
      {
        populate: [],
        fields: ['slug'],
        pagination: { page, pageSize: 100 },
        sort: ['publishedAt:desc'],
      } as never,
      {
        profile: 'hours',
        tags: ['blog-posts-slugs'],
      },
    )

    slugs.push(...(res.data || []).map((post) => post.slug))
    pageCount = res.meta?.pagination?.pageCount ?? 1
    page += 1
  }

  return slugs
}

export async function checkDuplicatePost(
  sourceUrl: string,
  excludeDocumentId?: string,
): Promise<BlogPost | null> {
  try {
    const filters: Record<string, unknown> = {
      sourceUrl: { $eq: sourceUrl },
    }

    if (excludeDocumentId) {
      filters['documentId'] = { $ne: excludeDocumentId }
    }

    const res = await cmsFetch<CmsList<BlogPost>>('/blog-posts', {
      filters,
      populate: ['thumbnail'],
      pagination: { page: 1, pageSize: 1 },
      noCache: true,
    })

    return res.data[0] ?? null
  } catch {
    return null
  }
}

export async function getRelatedPosts(post: BlogPost, limit = 4): Promise<BlogPost[]> {
  try {
    const filters: Record<string, unknown> = {
      slug: { $ne: post.slug },
    }

    if (post.categories?.length) {
      filters['categories'] = { slug: { $in: post.categories.map((category) => category.slug) } }
    }

    const res = await cachedCmsFetch<CmsList<BlogPost>>(
      '/blog-posts',
      {
        filters,
        sort: ['publishedAt:desc'],
        pagination: { page: 1, pageSize: limit },
        populate: POPULATE_LIST,
      },
      {
        profile: 'hours',
        tags: ['blog-posts-related'],
      },
    )

    return res.data
  } catch {
    return []
  }
}

/**
 * Calls the CMS compatibility endpoint which performs an atomic DB increment,
 * avoiding race conditions that occur when multiple readers write back currentViews+1.
 */
export async function incrementPostViews(documentId: string): Promise<void> {
  const cmsUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001'

  await fetch(`${cmsUrl}/api/posts/${documentId}/view`, {
    method: 'POST',
    cache: 'no-store',
  }).catch(() => {})
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categories: Category[] = []
    let page = 1
    let pageCount = 1

    while (page <= pageCount) {
      const res = await cachedCmsFetch<CmsList<Category>>(
        '/categories',
        {
          sort: ['order:asc', 'name:asc'],
          populate: ['parent'],
          pagination: { page, pageSize: 100 },
        },
        {
          profile: 'hours',
          tags: ['categories'],
        },
      )

      categories.push(...(res.data || []))
      pageCount = res.meta?.pagination?.pageCount ?? 1
      page += 1
    }

    return categories
  } catch (error) {
    logger.error('Failed to fetch categories', { error })
    return []
  }
}

export async function getAllTags(): Promise<BlogTag[]> {
  try {
    const tags: BlogTag[] = []
    let page = 1
    let pageCount = 1

    while (page <= pageCount) {
      const res = await cachedCmsFetch<CmsList<BlogTag>>(
        '/blog-tags',
        {
          sort: ['name:asc'],
          pagination: { page, pageSize: 100 },
        },
        {
          profile: 'hours',
          tags: ['blog-tags'],
        },
      )

      tags.push(...(res.data || []))
      pageCount = res.meta?.pagination?.pageCount ?? 1
      page += 1
    }

    return tags
  } catch (error) {
    logger.error('Failed to fetch blog tags', { error })
    return []
  }
}

export interface BlogArchiveStat {
  year: number
  total: number
  months: { month: number; count: number }[]
}

export async function getBlogArchiveIndex(): Promise<BlogArchiveStat[]> {
  try {
    const res = await cachedCmsFetch<{ data: BlogArchiveStat[] }>(
      '/blog-posts/archive-index',
      {},
      {
        profile: 'hours',
        tags: ['blog-posts'],
      },
    )

    return res.data ?? []
  } catch {
    return []
  }
}

export async function getBlogArchive(
  year: number,
  month: number,
  page = 1,
  pageSize = 12,
): Promise<CmsList<BlogPost>> {
  const url = Number.isNaN(month)
    ? `/blog-posts/archive?year=${year}&page=${page}&pageSize=${pageSize}`
    : `/blog-posts/archive?year=${year}&month=${month}&page=${page}&pageSize=${pageSize}`

  return cachedCmsFetch<CmsList<BlogPost>>(url, {}, {
    profile: 'hours',
    tags: ['blog-posts'],
  })
}
