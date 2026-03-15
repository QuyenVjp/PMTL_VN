// ─────────────────────────────────────────────────────────────
//  lib/api/blog.ts — BlogPost API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────

import { cmsFetch } from '@/lib/cms'
import type { BlogPost, CmsList, CmsSingle, Category, BlogTag } from '@/types/cms'

/** Shared populate config for all post queries */
const POPULATE_FULL = [
  'thumbnail',
  'gallery',
  'seo',
  'categories',
  'tags'
]

/** Lightweight populate for list views */
const POPULATE_LIST = ['thumbnail', 'gallery', 'categories', 'tags']

/** Minimal populate for SEO metadata only (faster) */
const POPULATE_METADATA = ['thumbnail', 'seo']

export interface GetPostsOptions {
  page?: number
  pageSize?: number
  categorySlug?: string
  tagSlugs?: string[]              // NEW: filter by one or more tags
  search?: string
  source?: string
  featured?: boolean
  language?: 'vi' | 'zh'
  /** Date string like '2026-02-01T00:00:00Z' */
  dateFrom?: string
  /** Date string like '2026-03-01T00:00:00Z' */
  dateTo?: string
  sort?: 'relevance' | 'newest' | 'oldest' | 'most-viewed'
  /** revalidate interval in seconds — default 60 */
  revalidate?: number
  /** Force bypass all caches */
  noCache?: boolean
}

/** Get paginated list of published blog posts */
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
  if (tagSlugs && tagSlugs.length > 0) {
    // Filter by one or more tags (ANY tag match)
    filters['tags'] = { slug: { $in: tagSlugs } }
  }
  if (source) {
    filters['sourceName'] = { $containsi: source }
  }
  if (featured !== undefined) {
    filters['featured'] = { $eq: featured }
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

  return cmsFetch<CmsList<BlogPost>>('/blog-posts', {
    sort: sortOrder,
    filters,
    pagination: { page, pageSize },
    populate: POPULATE_LIST,
    noCache: options.noCache || revalidate === 0,
    next: { revalidate, tags: ['blog-posts'] },
  })
}

/** Get a single blog post by slug */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const res = await cmsFetch<CmsList<BlogPost>>('/blog-posts', {
    filters: { slug: { $eq: slug } },
    populate: POPULATE_FULL,
    pagination: { page: 1, pageSize: 1 },
    noCache: false, // Can use cache now since we have request deduplication
    next: { revalidate: 3600, tags: [`blog-post-${slug}`] },
  })

  return res.data[0] ?? null
}

/**
 * Get post for metadata generation only (faster)
 * Returns only fields needed for SEO: title, slug, content preview, thumbnail, seo
 * Used in generateMetadata() to avoid fetching full content
 */
export async function getPostBySlugForMetadata(slug: string): Promise<BlogPost | null> {
  const res = await cmsFetch<CmsList<BlogPost>>('/blog-posts', {
    filters: { slug: { $eq: slug } },
    populate: POPULATE_METADATA,
    pagination: { page: 1, pageSize: 1 },
    fields: ['title', 'slug', 'content', 'publishedAt', 'createdAt'],
    noCache: false,
    next: { revalidate: 3600, tags: [`blog-post-seo-${slug}`] },
  })

  return res.data[0] ?? null
}

/** Get a blog post by documentId */
export async function getPostById(documentId: string): Promise<BlogPost | null> {
  try {
    const res = await cmsFetch<CmsSingle<BlogPost>>(`/blog-posts/${documentId}`, {
      populate: POPULATE_FULL,
      next: { revalidate: 3600, tags: [`blog-post-${documentId}`] },
    })
    return res.data
  } catch {
    return null
  }
}

/** Get all slugs (for generateStaticParams) */
export async function getAllPostSlugs(): Promise<string[]> {
  const slugs: string[] = []
  let page = 1
  let pageCount = 1

  while (page <= pageCount) {
    const res = await cmsFetch<CmsList<Pick<BlogPost, 'slug'>>>('/blog-posts', {
      populate: [],
      fields: ['slug'],
      pagination: { page, pageSize: 100 },
      sort: ['publishedAt:desc'],
      next: { revalidate: 3600, tags: ['blog-posts-slugs'] },
    } as never)

    slugs.push(...(res.data || []).map((p) => p.slug))
    pageCount = res.meta?.pagination?.pageCount ?? 1
    page++
  }
  return slugs
}

/**
 * Check if a post with the same source already exists.
 * Returns the existing post if found.
 */
export async function checkDuplicatePost(
  sourceUrl: string,
  excludeDocumentId?: string
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
      next: { revalidate: 0 },
    })
    return res.data[0] ?? null
  } catch {
    return null
  }
}

/** Get related posts for a given post (same category, different slug) */
export async function getRelatedPosts(post: BlogPost, limit = 4): Promise<BlogPost[]> {
  try {
    const filters: Record<string, unknown> = {
      slug: { $ne: post.slug },
    }
    if (post.categories && post.categories.length > 0) {
      filters['categories'] = { slug: { $in: post.categories.map(c => c.slug) } }
    }
    const res = await cmsFetch<CmsList<BlogPost>>('/blog-posts', {
      filters,
      sort: ['publishedAt:desc'],
      pagination: { page: 1, pageSize: limit },
      populate: POPULATE_LIST,
      next: { revalidate: 3600, tags: ['blog-posts-related'] },
    })
    return res.data
  } catch {
    return []
  }
}

/**
 * Increment view count for a post.
 * Calls the custom /view endpoint on Strapi which performs an atomic DB increment,
 * avoiding race conditions that occur when multiple readers write back currentViews+1.
 * No auth token required — the endpoint is public by design.
 */
export async function incrementPostViews(documentId: string): Promise<void> {
  const strapiUrl = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

  await fetch(`${strapiUrl}/api/posts/${documentId}/view`, {
    method: 'POST',
    cache: 'no-store',
  }).catch(() => { }) // fire-and-forget
}

/** Fetch all categories with parent relations populated.
 * Returns flat list; client can build tree using parent/children relations.
 * Note: Strapi draftAndPublish is disabled for Category, so all entries shown.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const allCategories: Category[] = []
    let page = 1
    let pageCount = 1

    while (page <= pageCount) {
      const res = await cmsFetch<CmsList<Category>>('/categories', {
        sort: ['order:asc', 'name:asc'],
        populate: ['parent'],
        pagination: { page, pageSize: 100 },
        next: { revalidate: 3600, tags: ['categories'] },
      })
      allCategories.push(...(res.data || []))
      pageCount = res.meta?.pagination?.pageCount ?? 1
      page++
    }
    return allCategories
  } catch (err) {
    console.error('Failed to fetch categories:', err)
    return []
  }
}

/**
 * Fetch all blog tags
 * Sorted by name for UI display
 * Cached for 1 hour (tags rarely change)
 */
export async function getAllTags(): Promise<BlogTag[]> {
  try {
    const allTags: BlogTag[] = []
    let page = 1
    let pageCount = 1

    while (page <= pageCount) {
      const res = await cmsFetch<CmsList<BlogTag>>('/blog-tags', {
        sort: ['name:asc'],
        pagination: { page, pageSize: 100 },
        next: { revalidate: 3600, tags: ['blog-tags'] },
      })
      allTags.push(...(res.data || []))
      pageCount = res.meta?.pagination?.pageCount ?? 1
      page++
    }
    return allTags
  } catch (err) {
    console.error('Failed to fetch tags:', err)
    return []
  }
}

/** ─── ARCHIVE API cho Blog ─── */

export interface BlogArchiveStat {
  year: number
  total: number
  months: { month: number; count: number }[]
}

export async function getBlogArchiveIndex(): Promise<BlogArchiveStat[]> {
  try {
    const res = await cmsFetch<{ data: BlogArchiveStat[] }>('/blog-posts/archive-index', {
      next: { revalidate: 3600, tags: ['blog-posts'] },
    })
    return res.data ?? []
  } catch {
    return []
  }
}

export async function getBlogArchive(year: number, month: number, page = 1, pageSize = 12): Promise<CmsList<BlogPost>> {
  const url = Number.isNaN(month)
    ? `/blog-posts/archive?year=${year}&page=${page}&pageSize=${pageSize}`
    : `/blog-posts/archive?year=${year}&month=${month}&page=${page}&pageSize=${pageSize}`

  return cmsFetch<CmsList<BlogPost>>(url, {
    next: { revalidate: 3600, tags: ['blog-posts'] },
  })
}


