import {
  buildSemanticSearchText,
  expandSemanticQuery,
  mapSearchSourceToResult,
  normalizeSemanticText,
  rerankSearchResults,
  searchQuerySchema,
} from "@pmtl/shared";

import { meilisearchClient } from "@/integrations/meilisearch/client";
import { syncSearchDocument } from "@/integrations/meilisearch/sync-document";
import { getLogger, withError } from "@/services/logger.service";
import { enqueueSearchSyncJob, getQueueJobCounts } from "@/services/queue.service";
import type { ContentDocument } from "./types";
import type { Payload } from "payload";
import { QUEUE_NAMES } from "@pmtl/shared";

const postsIndexName = process.env.MEILI_POSTS_INDEX?.trim() || "posts";
const logger = getLogger("services:search");

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null; name?: string | null; slug?: string | null };

type SearchSyncRequest = {
  payload: {
    findByID: (...args: unknown[]) => Promise<unknown>;
  };
};

function isCategoryObject(
  value: unknown,
): value is { id?: string | number | null; name?: string | null; slug?: string | null } {
  return typeof value === "object" && value !== null;
}

function isSearchSyncRequest(value: unknown): value is SearchSyncRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = (value as { payload?: unknown }).payload;
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  return typeof (payload as { findByID?: unknown }).findByID === "function";
}

async function resolveRelationship(
  collection: "categories" | "tags",
  value: RelationshipValue,
  req?: unknown,
): Promise<{ name: string | null; slug: string | null }> {
  if (isCategoryObject(value)) {
    const name = typeof value.name === "string" && value.name.trim() ? value.name.trim() : null;
    const slug = typeof value.slug === "string" && value.slug.trim() ? value.slug.trim() : null;

    if (name || slug) {
      return { name, slug };
    }
  }

  if (!isSearchSyncRequest(req)) {
    return { name: null, slug: null };
  }

  const rawId = isCategoryObject(value) ? value.id : value;
  if (typeof rawId !== "string" && typeof rawId !== "number") {
    return { name: null, slug: null };
  }

  try {
    const relationship = await req.payload.findByID({
      collection,
      id: rawId,
      depth: 0,
    });

    if (isCategoryObject(relationship)) {
      return {
        name:
          typeof relationship.name === "string" && relationship.name.trim()
            ? relationship.name.trim()
            : null,
        slug:
          typeof relationship.slug === "string" && relationship.slug.trim()
            ? relationship.slug.trim()
            : null,
      };
    }
  } catch (error) {
    logger.warn(
      withError(
        {
          collection,
          relationshipId: rawId,
        },
        error,
      ),
      "Failed to resolve search relationship",
    );
    return { name: null, slug: null };
  }

  return { name: null, slug: null };
}

export async function syncPostSearch(document: ContentDocument, req?: unknown): Promise<void> {
  const topic = document.topic ? await resolveRelationship("categories", document.topic, req) : { name: null, slug: null };
  const resolvedTags = await Promise.all(
    (document.tags ?? []).map((tag) => resolveRelationship("tags", tag, req)),
  );

  const tags = resolvedTags
    .map((tag) => tag.name)
    .filter((tag): tag is string => Boolean(tag));

  const tagSlugs = [
    ...(document.tagSlugs ?? []),
    ...resolvedTags.map((tag) => tag.slug).filter((tag): tag is string => Boolean(tag)),
  ];

  const contentPlainText = document.contentPlainText?.trim() ?? "";
  const semantic = buildSemanticSearchText([
    document.sourceRef ?? "",
    document.title,
    document.excerpt ?? "",
    contentPlainText,
    topic.name ?? "",
    tags.join(" "),
  ]);

  const normalized = normalizeSemanticText(
    [
      document.sourceRef ?? "",
      document.title,
      document.slug,
      contentPlainText,
      topic.name ?? "",
      tags.join(" "),
      semantic.semanticHints.join(" "),
    ].join(" "),
  );

  await syncSearchDocument(postsIndexName, {
    id: document.publicId ?? document.id,
    documentId: String(document.documentId ?? document.id ?? document.publicId ?? ""),
    sourceRef: document.sourceRef ?? "",
    title: document.title,
    slug: document.slug,
    excerpt: document.excerpt ?? "",
    contentPlainText,
    topic: topic.name ?? "",
    topicSlug: document.topicSlug ?? topic.slug ?? "",
    tags,
    tagSlugs: Array.from(new Set(tagSlugs)),
    semanticText: semantic.semanticText,
    semanticHints: semantic.semanticHints,
    normalizedSearchText: normalized,
    publishedAt: document.publishedAt ?? null,
    views: typeof document.views === "number" ? document.views : 0,
    featured: Boolean(document.featured),
    thumbnail: document.thumbnailUrl
      ? {
          url: document.thumbnailUrl,
          alternativeText: document.thumbnailAlt ?? null,
        }
      : null,
    type: "post",
  });
}

export async function queueOrSyncPostSearch(document: ContentDocument, req?: unknown): Promise<"queued" | "synced"> {
  const queued = await enqueueSearchSyncJob(document);

  if (queued) {
    return "queued";
  }

  await syncPostSearch(document, req);

  return "synced";
}

export async function syncEventSearch(document: ContentDocument): Promise<void> {
  const semantic = buildSemanticSearchText([
    document.title,
    document.excerpt ?? "",
    document.contentPlainText ?? "",
  ]);

  await syncSearchDocument("events", {
    id: document.publicId ?? document.id,
    documentId: String(document.documentId ?? document.id ?? document.publicId ?? ""),
    title: document.title,
    slug: document.slug,
    excerpt: document.excerpt ?? "",
    semanticText: semantic.semanticText,
    semanticHints: semantic.semanticHints,
    normalizedSearchText: normalizeSemanticText(semantic.semanticText),
    type: "event",
  });
}

type SearchPostsInput = {
  payload: Payload;
  query: string;
  limit?: number;
};

type SearchPostHit = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  sourceRef?: string | null;
  publishedAt?: string | null;
  topic?: string | null;
  tags?: string[] | null;
  semanticHints?: string[] | null;
  featured?: boolean | null;
  views?: number | null;
  _rankingScore?: number | null;
  thumbnail?:
    | {
        url?: string | null;
        alternativeText?: string | null;
      }
    | null;
};

function mapSearchHitToPostResult(hit: SearchPostHit) {
  const result = mapSearchSourceToResult({
    id: hit.id,
    type: "post",
    title: hit.title,
    slug: hit.slug,
    excerpt: hit.excerpt ?? "",
  });

  return {
    ...result,
    sourceRef: hit.sourceRef ?? "",
    publishedAt: hit.publishedAt ?? null,
    topic: hit.topic ?? "",
    tags: hit.tags ?? [],
    semanticHints: hit.semanticHints ?? [],
    featured: Boolean(hit.featured),
    viewCount: typeof hit.views === "number" ? hit.views : 0,
    _rankingScore: hit._rankingScore ?? null,
    thumbnail: hit.thumbnail ?? null,
  };
}

async function searchPostsViaPayload({ payload, query, limit }: SearchPostsInput) {
  const normalizedQuery = normalizeSemanticText(query);
  const result = await payload.find({
    collection: "posts",
    depth: 0,
    ...(limit ? { limit } : {}),
    where: {
      or: [
        {
          title: {
            like: query,
          },
        },
        {
          normalizedSearchText: {
            like: normalizedQuery,
          },
        },
        {
          sourceRef: {
            like: query,
          },
        },
      ],
    },
  });

  return {
    totalHits: result.totalDocs,
    hits: rerankSearchResults(
      result.docs.map((document) =>
        mapSearchHitToPostResult({
          id: document.publicId ?? String(document.id),
          title: document.title,
          slug: document.slug,
          excerpt: document.excerptComputed ?? "",
          sourceRef: document.sourceRef ?? "",
          publishedAt: document.publishedAt ?? null,
          semanticHints: [],
          featured: document.postFlags?.featured ?? false,
          views: document.views ?? 0,
        }),
      ),
      query,
    ),
    engine: "payload-fallback" as const,
  };
}

export async function searchPosts(input: SearchPostsInput) {
  const parsedInput = searchQuerySchema.parse({
    q: input.query,
    limit: input.limit,
  });

  if (!meilisearchClient) {
    return searchPostsViaPayload({
      payload: input.payload,
      query: parsedInput.q,
      limit: parsedInput.limit,
    });
  }

  const postsIndex = meilisearchClient.index(postsIndexName);
  const semanticQueries = Array.from(
    new Set([parsedInput.q, ...expandSemanticQuery(parsedInput.q)]),
  ).slice(0, 4);

  const responses = await Promise.all(
    semanticQueries.map((query, index) =>
      postsIndex.search<SearchPostHit>(query, {
        limit: parsedInput.limit,
        attributesToHighlight: ["title", "excerpt"],
        showRankingScore: true,
        ...(index === 0
          ? {}
          : {
              matchingStrategy: "all",
            }),
      }),
    ),
  );

  const dedupedHits = new Map<string, SearchPostHit>();

  for (const response of responses) {
    for (const hit of response.hits) {
      const existingHit = dedupedHits.get(hit.id);

      if (!existingHit || (hit._rankingScore ?? 0) > (existingHit._rankingScore ?? 0)) {
        dedupedHits.set(hit.id, hit);
      }
    }
  }

  const rankedHits = rerankSearchResults(
    Array.from(dedupedHits.values()).map(mapSearchHitToPostResult),
    parsedInput.q,
  ).slice(0, parsedInput.limit);

  return {
    totalHits: responses[0]?.estimatedTotalHits ?? rankedHits.length,
    hits: rankedHits,
    engine: "meilisearch" as const,
  };
}

export async function enqueuePostReindexBatch(payload: Payload, options?: { limit?: number; page?: number }) {
  const limit = options?.limit && options.limit > 0 ? options.limit : 100;
  const page = options?.page && options.page > 0 ? options.page : 1;
  const result = await payload.find({
    collection: "posts",
    depth: 0,
    limit,
    page,
    overrideAccess: true,
  });

  const queued = await Promise.all(
    result.docs.map((document) =>
      enqueueSearchSyncJob({
        id: document.id,
        documentId: document.id ? String(document.id) : null,
        publicId: document.publicId ?? null,
        slug: document.slug,
        title: document.title,
        sourceRef: document.sourceRef ?? "",
        excerpt: document.excerptComputed ?? "",
        contentPlainText: document.contentPlainText ?? "",
        topic: document.primaryCategory ?? null,
        tags: document.tags ?? [],
        publishedAt: document.publishedAt ?? null,
        views: document.views ?? 0,
        featured: document.postFlags?.featured ?? false,
      }),
    ),
  );

  return {
    page,
    limit,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    queuedCount: queued.filter(Boolean).length,
  };
}

export async function getPostSearchStatus(payload: Payload) {
  const [postCount, queue, meiliHealth, meiliStats, indexStats, recentTasks] = await Promise.all([
    payload.count({
      collection: "posts",
      overrideAccess: true,
    }),
    getQueueJobCounts(QUEUE_NAMES.searchSync),
    meilisearchClient?.health().catch(() => null) ?? Promise.resolve(null),
    meilisearchClient?.getStats().catch(() => null) ?? Promise.resolve(null),
    meilisearchClient?.index(postsIndexName).getStats().catch(() => null) ?? Promise.resolve(null),
    meilisearchClient?.tasks.getTasks({ indexUids: [postsIndexName], limit: 5 }).catch(() => null) ?? Promise.resolve(null),
  ]);

  return {
    engine: meilisearchClient ? "meilisearch" : "payload-fallback",
    postsIndexName,
    postsInCms: postCount.totalDocs,
    queue,
    meilisearch: {
      enabled: Boolean(meilisearchClient),
      healthy: meiliHealth?.status === "available",
      status: meiliHealth?.status ?? "unavailable",
      databaseSize: meiliStats?.databaseSize ?? null,
      lastUpdate: meiliStats?.lastUpdate ?? null,
      indexes: meiliStats?.indexes ?? {},
      index: indexStats
        ? {
            numberOfDocuments: indexStats.numberOfDocuments ?? 0,
            isIndexing: indexStats.isIndexing ?? false,
            fieldDistribution: indexStats.fieldDistribution ?? {},
          }
        : null,
      recentTasks:
        recentTasks?.results?.map((task: { uid: number; status: string; type: string; enqueuedAt?: string | null; startedAt?: string | null; finishedAt?: string | null; error?: unknown }) => ({
          uid: task.uid,
          status: task.status,
          type: task.type,
          enqueuedAt: task.enqueuedAt ?? null,
          startedAt: task.startedAt ?? null,
          finishedAt: task.finishedAt ?? null,
          error: task.error ?? null,
        })) ?? [],
    },
  };
}
