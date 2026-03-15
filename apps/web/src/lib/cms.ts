import qs from "qs";

import { isCmsError } from "@/types/cms";
import type { CmsEvent } from "@/types/cms";

export const CMS_API_URL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  process.env.CMS_PUBLIC_URL ??
  "http://localhost:3001";

const PAYLOAD_URL = CMS_API_URL;

function getServerToken(): string | undefined {
  if (typeof window !== "undefined") {
    return undefined;
  }

  return process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN;
}

export interface CmsFetchOptions {
  populate?: string | string[] | Record<string, unknown>;
  fields?: string[];
  filters?: Record<string, unknown>;
  sort?: string | string[];
  pagination?: { page?: number; pageSize?: number };
  status?: "published" | "draft";
  next?: NextFetchRequestConfig;
  noCache?: boolean;
}

type PayloadListResponse<T> = {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
};

function toCmsList<T>(data: T[], page = 1, pageSize = 0, total = data.length) {
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

function mapPayloadEventToLegacy(event: Record<string, unknown>): CmsEvent {
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

async function payloadBridgeFetch<T>(path: string, options: CmsFetchOptions): Promise<T | null> {
  const page = options.pagination?.page ?? 1;
  const pageSize = options.pagination?.pageSize ?? 20;

  if (path === "/blog-posts") {
    const filters = options.filters ?? {};
    const search =
      typeof filters.search === "string" && filters.search.trim() ? filters.search.trim() : null;
    const categorySlug =
      typeof filters.categorySlug === "string" && filters.categorySlug.trim()
        ? filters.categorySlug.trim()
        : null;

    if (search) {
      const url = new URL("/api/posts/search", PAYLOAD_URL);
      url.searchParams.set("q", search);
      url.searchParams.set("limit", String(pageSize));

      const response = await fetch(url.toString(), { cache: "no-store" });

      if (!response.ok) {
        return toCmsList([], page, pageSize, 0) as T;
      }

      const payload = (await response.json()) as {
        hits?: Array<Record<string, unknown>>;
        totalHits?: number;
      };

      const data = (payload.hits ?? []).map((post) =>
        mapPayloadPostToLegacy({
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          publishedAt: post.publishedAt,
          viewCount: post.viewCount,
          sourceRef: post.sourceRef,
          images: post.thumbnail
            ? [
                {
                  id: post.id,
                  alt: (post.thumbnail as { alternativeText?: string | null }).alternativeText,
                  filename: post.title,
                  url: (post.thumbnail as { url?: string | null }).url,
                },
              ]
            : [],
        }),
      );

      return toCmsList(data, page, pageSize, payload.totalHits ?? data.length) as T;
    }

    const url = new URL("/api/posts", PAYLOAD_URL);
    url.searchParams.set("depth", "1");
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("page", String(page));
    url.searchParams.set("sort", "-publishedAt");
    if (categorySlug) {
      url.searchParams.set("where[primaryCategory.slug][equals]", categorySlug);
    }

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return toCmsList([], page, pageSize, 0) as T;
    }

    const payload = (await response.json()) as PayloadListResponse<Record<string, unknown>>;
    const data = (payload.docs ?? []).map(mapPayloadPostToLegacy);

    return toCmsList(
      data,
      payload.page ?? page,
      payload.limit ?? pageSize,
      payload.totalDocs ?? data.length,
    ) as T;
  }

  if (path === "/events") {
    const url = new URL("/api/events", PAYLOAD_URL);
    url.searchParams.set("depth", "0");
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("page", String(page));
    url.searchParams.set("sort", "-startAt");

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return toCmsList([], page, pageSize, 0) as T;
    }

    const payload = (await response.json()) as PayloadListResponse<Record<string, unknown>>;
    const data = (payload.docs ?? []).map(mapPayloadEventToLegacy);

    return toCmsList(
      data,
      payload.page ?? page,
      payload.limit ?? pageSize,
      payload.totalDocs ?? data.length,
    ) as T;
  }

  if (path === "/blog-tags") {
    const url = new URL("/api/categories", PAYLOAD_URL);
    url.searchParams.set("depth", "0");
    url.searchParams.set("limit", "200");
    url.searchParams.set("page", "1");
    url.searchParams.set("sort", "name");

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return toCmsList([], 1, 200, 0) as T;
    }

    const payload = (await response.json()) as PayloadListResponse<Record<string, unknown>>;
    const data = (payload.docs ?? []).map((category) => ({
      createdAt: String(category.createdAt ?? new Date().toISOString()),
      description: null,
      documentId: String(category.id ?? ""),
      id: Number(category.id ?? 0),
      name: String(category.name ?? "Tag"),
      slug: String(category.slug ?? ""),
      updatedAt: String(category.updatedAt ?? new Date().toISOString()),
    }));

    return toCmsList(data, 1, 200, payload.totalDocs ?? data.length) as T;
  }

  return null;
}

export function buildCmsUrl(
  path: string,
  options: Omit<CmsFetchOptions, "next" | "noCache"> = {},
): string {
  const { populate, fields, filters, sort, pagination, status } = options;
  const query = qs.stringify(
    { populate, fields, filters, sort, pagination, status },
    { encodeValuesOnly: true, skipNulls: true },
  );

  return `${CMS_API_URL}/api${path}${query ? `?${query}` : ""}`;
}

export async function cmsFetch<T>(path: string, options: CmsFetchOptions = {}): Promise<T> {
  const bridged = await payloadBridgeFetch<T>(path, options);

  if (bridged !== null) {
    return bridged;
  }

  const { next, noCache, ...queryOptions } = options;
  const url = buildCmsUrl(path, queryOptions);
  const token = getServerToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isDraft = queryOptions.status === "draft";
  const cacheStrategy = noCache || isDraft ? "no-store" : "force-cache";

  try {
    const response = await fetch(url, {
      headers,
      next:
        cacheStrategy === "no-store"
          ? undefined
          : { revalidate: next?.revalidate ?? 3600, tags: next?.tags },
      cache: cacheStrategy,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody?.error?.message ?? response.statusText;
      console.error(`[CMS ${response.status}] ${path}: ${errorMessage}`);
      throw new CMSAPIError(response.status, errorMessage, path);
    }

    const json = await response.json();

    if (isCmsError(json)) {
      const errorMessage = json.error?.message ?? "Unknown error";
      console.error(`[CMS ${json.error?.status}] ${path}: ${errorMessage}`);
      throw new CMSAPIError(json.error.status, errorMessage, path);
    }

    return json as T;
  } catch (error) {
    if (isBridgePath(path)) {
      return toCmsList(
        [],
        options.pagination?.page ?? 1,
        options.pagination?.pageSize ?? 20,
        0,
      ) as T;
    }

    if (error instanceof CMSAPIError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`[CMS FATAL] ${path}: ${message}`);
    throw new CMSAPIError(500, message, path);
  }
}

export function getCmsMediaUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `${CMS_API_URL}${url}`;
}

export const cmsImageUrl = (path: string | null | undefined) =>
  getCmsMediaUrl(path) ?? "/images/logoo.png";

export class CMSAPIError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path: string,
  ) {
    super(`[CMS ${status}] ${path}: ${message}`);
    this.name = "CMSAPIError";
  }
}
