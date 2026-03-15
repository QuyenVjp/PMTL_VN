import 'server-only'

import { cache } from 'react'
import { z } from 'zod'
import { expandSemanticQuery } from '@pmtl/shared'

const meilisearchEnvSchema = z.object({
  host: z.string().url(),
  indexName: z.string().min(1).default('posts'),
})

const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small'
const DEFAULT_EMBEDDER = 'default'
const DEFAULT_SEMANTIC_RATIO = 0.35
const DEFAULT_INDEX = 'posts'

const parseMeilisearchConfig = () =>
  meilisearchEnvSchema.safeParse({
    host: process.env.MEILISEARCH_HOST ?? process.env.MEILI_HOST ?? process.env.NEXT_PUBLIC_MEILISEARCH_HOST,
    indexName: process.env.MEILISEARCH_BLOG_POST_INDEX ?? process.env.MEILI_POSTS_INDEX ?? DEFAULT_INDEX,
  })

export const isMeilisearchConfigured = cache(() => parseMeilisearchConfig().success)

const getMeilisearchConfig = cache(() => {
  const parsed = parseMeilisearchConfig()

  if (!parsed.success) {
    return null
  }

  return parsed.data
})

const getMeilisearchApiKeys = cache(() => {
  const keys = [
    process.env.MEILISEARCH_MASTER_KEY,
    process.env.MEILISEARCH_API_KEY,
    process.env.MEILISEARCH_SEARCH_KEY,
    process.env.MEILI_MASTER_KEY,
    process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY,
    process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY,
  ].filter((value): value is string => Boolean(value?.trim()))

  return Array.from(new Set(keys))
})

function buildMeiliHeaders(apiKey?: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  }
}

function buildSearchFilters(options: {
  categorySlug?: string
  tagSlugs?: string[]
  dateFrom?: string
  dateTo?: string
}) {
  const filters: string[] = []

  if (options.categorySlug) {
    filters.push(`topicSlug = "${options.categorySlug}"`)
  }

  if (options.tagSlugs && options.tagSlugs.length > 0) {
    const tagFilters = options.tagSlugs.map((slug) => `tagSlugs = "${slug}"`).join(' OR ')
    filters.push(`(${tagFilters})`)
  }

  if (options.dateFrom) {
    filters.push(`publishedAt >= "${options.dateFrom}"`)
  }

  if (options.dateTo) {
    filters.push(`publishedAt <= "${options.dateTo}"`)
  }

  return filters.length > 0 ? filters.join(' AND ') : undefined
}

function buildSortOptions(sort: 'relevance' | 'newest' | 'oldest' | 'most-viewed', query: string) {
  if (sort === 'newest') return ['publishedAt:desc']
  if (sort === 'oldest') return ['publishedAt:asc']
  if (sort === 'most-viewed') return ['views:desc', 'publishedAt:desc']
  if (!query.trim()) return ['publishedAt:desc']
  return undefined
}

function getSemanticSearchConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()

  if (!apiKey) {
    return null
  }

  return {
    apiKey,
    model: process.env.OPENAI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL,
    embedder: process.env.MEILI_SEMANTIC_EMBEDDER?.trim() || DEFAULT_EMBEDDER,
    semanticRatio: Number(process.env.MEILI_SEMANTIC_RATIO ?? DEFAULT_SEMANTIC_RATIO),
  }
}

async function generateQueryEmbedding(query: string): Promise<number[] | null> {
  const config = getSemanticSearchConfig()
  const normalized = query.trim()

  if (!config || !normalized) {
    return null
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      input: normalized,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Query embedding failed with status ${response.status}`)
  }

  const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> }
  const embedding = payload.data?.[0]?.embedding
  return Array.isArray(embedding) ? embedding : null
}

async function executeSearchRequest<T>(
  apiKey: string | undefined,
  payload: Record<string, unknown>,
): Promise<{
  hits: T[]
  estimatedTotalHits: number
}> {
  const config = getMeilisearchConfig()

  if (!config) {
    throw new Error('Meilisearch is not configured')
  }

  const response = await fetch(`${config.host}/indexes/${config.indexName}/search`, {
    method: 'POST',
    headers: buildMeiliHeaders(apiKey),
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Meilisearch search failed with status ${response.status}`)
  }

  return (response.json() as Promise<{ hits: T[]; estimatedTotalHits?: number }>).then((result) => ({
    hits: result.hits ?? [],
    estimatedTotalHits: result.estimatedTotalHits ?? 0,
  }))
}

function mergeHits<T extends { id?: string | number; slug?: string }>(primary: T[], fallback: T[]) {
  const merged = new Map<string, T>()

  for (const item of [...primary, ...fallback]) {
    const key = String(item.id ?? item.slug ?? '')
    if (!key || merged.has(key)) {
      continue
    }
    merged.set(key, item)
  }

  return Array.from(merged.values())
}

/**
 * Search blog posts via Meilisearch.
 * Uses hybrid vector + keyword search when semantic embeddings are configured,
 * otherwise falls back to lexical search plus semantic query expansion.
 */
export async function searchBlogPostsViaMeilisearch(
  query: string,
  options: {
    page?: number
    pageSize?: number
    sort?: 'relevance' | 'newest' | 'oldest' | 'most-viewed'
    categorySlug?: string
    tagSlugs?: string[]
    dateFrom?: string
    dateTo?: string
  } = {},
) {
  const { page = 1, pageSize = 10, sort = 'relevance', categorySlug, tagSlugs, dateFrom, dateTo } = options
  const config = getMeilisearchConfig()
  const apiKeys = getMeilisearchApiKeys()

  if (!config || apiKeys.length === 0) {
    throw new Error('Meilisearch is not configured')
  }

  const filter = buildSearchFilters({ categorySlug, tagSlugs, dateFrom, dateTo })
  const sortOptions = buildSortOptions(sort, query)
  const semanticConfig = getSemanticSearchConfig()
  const semanticQueries = expandSemanticQuery(query)
  const searchPayload: Record<string, unknown> = {
    q: query,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    ...(filter ? { filter } : {}),
    ...(sortOptions ? { sort: sortOptions } : {}),
    attributesToHighlight: ['title', 'excerpt', 'contentPlainText', 'semanticText'],
    highlightPreTag: '<mark class="bg-gold/20 text-gold rounded px-0.5">',
    highlightPostTag: '</mark>',
    attributesToRetrieve: [
      'id',
      'documentId',
      'title',
      'slug',
      'excerpt',
      'contentPlainText',
      'thumbnail',
      'views',
      'featured',
      'publishedAt',
      'sourceRef',
      'topic',
      'topicSlug',
      'tags',
      'tagSlugs',
      'semanticHints',
    ],
    attributesToCrop: ['excerpt', 'contentPlainText', 'semanticText'],
    cropLength: 180,
  }

  let vector: number[] | null = null
  if (semanticConfig && query.trim()) {
    try {
      vector = await generateQueryEmbedding(query)
    } catch (error) {
      console.warn('[Meilisearch] Query embedding unavailable, continuing with lexical search:', error)
    }
  }

  if (vector) {
    searchPayload.vector = vector
    searchPayload.hybrid = {
      embedder: semanticConfig?.embedder ?? DEFAULT_EMBEDDER,
      semanticRatio: semanticConfig?.semanticRatio ?? DEFAULT_SEMANTIC_RATIO,
    }
  }

  let lastError: unknown = null

  for (const apiKey of apiKeys) {
    try {
      const primaryResult = await executeSearchRequest<Record<string, unknown>>(apiKey, searchPayload)

      let hits = primaryResult.hits
      let total = primaryResult.estimatedTotalHits

      if (!vector && query.trim() && page === 1 && hits.length < pageSize && semanticQueries.length > 1) {
        const expansionPayload = {
          ...searchPayload,
          q: semanticQueries[1],
          limit: pageSize * 2,
          offset: 0,
        }

        const expansionResult = await executeSearchRequest<Record<string, unknown>>(apiKey, expansionPayload)
        hits = mergeHits(primaryResult.hits, expansionResult.hits).slice(0, pageSize)
        total = Math.max(primaryResult.estimatedTotalHits, expansionResult.estimatedTotalHits, hits.length)
      }

      return {
        data: hits,
        meta: {
          pagination: {
            page,
            pageSize,
            total,
            pageCount: Math.max(1, Math.ceil(Math.max(total, hits.length) / pageSize)),
          },
        },
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error('Meilisearch search failed')
}

export async function getAllBlogPostsViaMeilisearch(options: {
  page?: number
  pageSize?: number
  categorySlug?: string
  tagSlugs?: string[]
  dateFrom?: string
  dateTo?: string
} = {}) {
  return searchBlogPostsViaMeilisearch('', options)
}
