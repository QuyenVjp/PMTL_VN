// ─────────────────────────────────────────────────────────────
//  lib/strapi.ts — Legacy CMS bridge (Payload-first)
//
//  NOTE:
//  - Keep this filename/export for old FE compatibility.
//  - Runtime now points to Payload/CMS and bridges old Strapi paths.
// ─────────────────────────────────────────────────────────────

import qs from 'qs'
import { isStrapiError } from '@/types/strapi'
import type { StrapiEvent } from '@/types/strapi'

export const CMS_API_URL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  process.env.CMS_PUBLIC_URL ??
  "http://localhost:3001";
export const STRAPI_URL = CMS_API_URL;
const PAYLOAD_URL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  process.env.CMS_PUBLIC_URL ??
  "http://localhost:3001";

// Server-side token — NEVER exposed to browser
function getServerToken(): string | undefined {
  if (typeof window !== 'undefined') return undefined // safety: no client leakage
  return (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
}

export interface FetchOptions {
  /** Strapi populate param — default: '*' */
  populate?: string | string[] | Record<string, unknown>
  /** Strapi fields param — only fetch specific fields (performance optimization) */
  fields?: string[]
  /** Strapi filters */
  filters?: Record<string, unknown>
  /** Strapi sort e.g. ['createdAt:desc'] */
  sort?: string | string[]
  /** Pagination */
  pagination?: { page?: number; pageSize?: number }
  /** Draft & publish status */
  status?: 'published' | 'draft'
  /** Next.js fetch config for ISR */
  next?: NextFetchRequestConfig
  /** Force no-cache (for dynamic / real-time data) */
  noCache?: boolean
}

type PayloadListResponse<T> = {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
};

function toStrapiList<T>(data: T[], page = 1, pageSize = 0, total = data.length) {
  const safePageSize = pageSize || data.length || 1;
  return {
    data,
    meta: {
      pagination: {
        page,
        pageCount: Math.max(1, Math.ceil(total / safePageSize)),
        pageSize: safePageSize,
        total,
      },
    },
  };
}

function isBridgePath(path: string): boolean {
  return path === "/blog-posts" || path === "/events" || path === "/blog-tags";
}

function mapPayloadPostToLegacy(post: Record<string, unknown>) {
  const topic = (post.topic as Record<string, unknown> | null) ?? null;
  const tags = Array.isArray(post.tags) ? (post.tags as Record<string, unknown>[]) : [];
  const images = Array.isArray(post.images) ? (post.images as Record<string, unknown>[]) : [];
  const firstImage = images[0] ?? null;

  return {
    allowComments: true,
    audio_url: null,
    categories: topic
      ? [
          {
            description: null,
            id: Number(topic.id ?? 0),
            name: String(topic.name ?? "Chủ đề"),
            slug: String(topic.slug ?? ""),
          },
        ]
      : [],
    commentCount: 0,
    content: String(post.contentPlainText ?? post.excerpt ?? ""),
    createdAt: String(post.createdAt ?? new Date().toISOString()),
    documentId: String(post.id ?? ""),
    eventDate: null,
    excerpt: (post.excerpt as string | null) ?? null,
    featured: false,
    gallery: [],
    id: Number(post.id ?? 0),
    likes: 0,
    link: null,
    location: null,
    oembed: null,
    publishedAt: (post.publishedAt as string | null) ?? null,
    related_posts: [],
    seo: null,
    seriesKey: null,
    seriesNumber: null,
    slug: String(post.slug ?? ""),
    sourceName: String(post.sourceRef ?? ""),
    sourceTitle: null,
    sourceUrl: (post.sourceUrl as string | null) ?? null,
    speaker: "",
    tags: tags.map((tag) => ({
      id: Number(tag.id ?? 0),
      name: String(tag.name ?? "Tag"),
      slug: String(tag.slug ?? ""),
    })),
    thumbnail: firstImage
      ? {
          alternativeText: (firstImage.alt as string | null) ?? null,
          formats: null,
          height: null,
          id: Number(firstImage.id ?? 0),
          name: String(firstImage.filename ?? "image"),
          url: String(firstImage.url ?? ""),
          width: null,
        }
      : null,
    title: String(post.title ?? "Untitled"),
    unique_views: Number(post.viewCount ?? 0),
    updatedAt: String(post.updatedAt ?? new Date().toISOString()),
    video_url: null,
    views: Number(post.viewCount ?? 0),
    youtubeId: null,
  };
}

function mapPayloadEventToLegacy(event: Record<string, unknown>): StrapiEvent {
  const startAt = (event.startAt as string | null) ?? null;
  return {
    content: null,
    coverImage: null,
    createdAt: String(event.createdAt ?? new Date().toISOString()),
    date: startAt,
    description: String(event.summary ?? ""),
    documentId: String(event.id ?? ""),
    eventStatus: "upcoming",
    files: [],
    gallery: [],
    id: Number(event.id ?? 0),
    language: "vi",
    link: null,
    location: String(event.location ?? ""),
    oembed: null,
    publishedAt: (event.publishedAt as string | null) ?? null,
    slug: String(event.slug ?? ""),
    speaker: "",
    timeString: null,
    title: String(event.title ?? "Sự kiện"),
    type: "dharma-talk",
    updatedAt: String(event.updatedAt ?? new Date().toISOString()),
    youtubeId: null,
  };
}

async function payloadBridgeFetch<T>(path: string, options: FetchOptions): Promise<T | null> {
  const page = options.pagination?.page ?? 1;
  const pageSize = options.pagination?.pageSize ?? 20;

  if (path === "/blog-posts") {
    const url = new URL("/api/posts", PAYLOAD_URL);
    url.searchParams.set("depth", "1");
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("page", String(page));
    url.searchParams.set("sort", "-publishedAt");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return toStrapiList([], page, pageSize, 0) as T;

    const payload = (await res.json()) as PayloadListResponse<Record<string, unknown>>;
    const data = (payload.docs ?? []).map(mapPayloadPostToLegacy);
    return toStrapiList(data, payload.page ?? page, payload.limit ?? pageSize, payload.totalDocs ?? data.length) as T;
  }

  if (path === "/events") {
    const url = new URL("/api/events", PAYLOAD_URL);
    url.searchParams.set("depth", "0");
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("page", String(page));
    url.searchParams.set("sort", "-startAt");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return toStrapiList([], page, pageSize, 0) as T;

    const payload = (await res.json()) as PayloadListResponse<Record<string, unknown>>;
    const data = (payload.docs ?? []).map(mapPayloadEventToLegacy);
    return toStrapiList(data, payload.page ?? page, payload.limit ?? pageSize, payload.totalDocs ?? data.length) as T;
  }

  if (path === "/blog-tags") {
    const url = new URL("/api/categories", PAYLOAD_URL);
    url.searchParams.set("depth", "0");
    url.searchParams.set("limit", "200");
    url.searchParams.set("page", "1");
    url.searchParams.set("sort", "name");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return toStrapiList([], 1, 200, 0) as T;

    const payload = (await res.json()) as PayloadListResponse<Record<string, unknown>>;
    const data = (payload.docs ?? []).map((category) => ({
      createdAt: String(category.createdAt ?? new Date().toISOString()),
      description: null,
      documentId: String(category.id ?? ""),
      id: Number(category.id ?? 0),
      name: String(category.name ?? "Tag"),
      slug: String(category.slug ?? ""),
      updatedAt: String(category.updatedAt ?? new Date().toISOString()),
    }));

    return toStrapiList(data, 1, 200, payload.totalDocs ?? data.length) as T;
  }

  return null;
}

/**
 * Build full Strapi API URL with query params
 */
export function buildStrapiUrl(path: string, options: Omit<FetchOptions, 'next' | 'noCache'> = {}): string {
  const { populate, fields, filters, sort, pagination, status } = options
  const query = qs.stringify(
    { populate, fields, filters, sort, pagination, status },
    { encodeValuesOnly: true, skipNulls: true }
  )
  return `${STRAPI_URL}/api${path}${query ? `?${query}` : ''}`
}

/**
 * Server-side fetch with API token auth + ISR support.
 * ⚠️  Only call from Server Components, Server Actions, or Route Handlers.
 *     Never call from 'use client' files.
 *
 * Next.js automatically deduplicates identical fetch() calls within the
 * same render cycle — no manual cache needed.
 * Use On-Demand Revalidation via /api/revalidate for instant cache clearing.
 */
export async function strapiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const bridged = await payloadBridgeFetch<T>(path, options);
  if (bridged !== null) {
    return bridged;
  }

  const { next, noCache, ...queryOptions } = options
  const url = buildStrapiUrl(path, queryOptions)


  const token = getServerToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const isDraft = queryOptions.status === 'draft'
  const cacheStrategy = (noCache || isDraft) ? 'no-store' : 'force-cache'

  try {
    const res = await fetch(url, {
      headers,
      // Default revalidate: 3600s (1h)
      next: cacheStrategy === 'no-store' ? undefined : { revalidate: next?.revalidate ?? 3600, tags: next?.tags },
      cache: cacheStrategy,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const errMsg = err?.error?.message ?? res.statusText
      console.error(`[Strapi ${res.status}] ${path}: ${errMsg}`)
      throw new StrapiAPIError(res.status, errMsg, path)
    }

    const json = await res.json()


    if (isStrapiError(json)) {
      const errMsg = json.error?.message ?? 'Unknown error'
      console.error(`[Strapi ${json.error?.status}] ${path}: ${errMsg}`)
      throw new StrapiAPIError(json.error.status, errMsg, path)
    }

    return json as T
  } catch (error) {
    if (isBridgePath(path)) {
      return toStrapiList([], options.pagination?.page ?? 1, options.pagination?.pageSize ?? 20, 0) as T;
    }

    if (error instanceof StrapiAPIError) throw error
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[Strapi FATAL] ${path}: ${msg}`)
    throw new StrapiAPIError(500, msg, path)
  }
}

/**
 * Build a public asset URL from a Strapi media url field.
 * Handles both relative (/uploads/...) and absolute URLs.
 */
export function getStrapiMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

/** Legacy alias — kept for backward compat */
export const strapiImageUrl = (path: string | null | undefined) =>
  getStrapiMediaUrl(path) ?? '/images/logoo.png'

/** Custom error class for CMS bridge API errors */
export class CMSAPIError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path: string
  ) {
    super(`[Strapi ${status}] ${path}: ${message}`)
    this.name = "CMSAPIError"
  }
}

// Legacy alias to avoid touching all old imports at once.
export const StrapiAPIError = CMSAPIError;


