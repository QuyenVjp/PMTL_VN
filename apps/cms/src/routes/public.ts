import { getPayload } from "payload";
import type { CollectionSlug, DataFromCollectionSlug, GlobalSlug, PaginatedDocs } from "payload";

import config from "@/payload.config";
import { cachedFetch } from "@/services/cache.service";
import { getLogger, withError } from "@/services/logger.service";

const logger = getLogger("routes:public");
let payloadPromise: ReturnType<typeof getPayload> | null = null;

export async function getCmsPayload() {
  if (!payloadPromise) {
    payloadPromise = getPayload({
      config,
    }).catch((error) => {
      payloadPromise = null;
      throw error;
    });
  }

  return payloadPromise;
}

export function buildPublicCacheHeaders(
  ttlSeconds: number,
  options?: {
    staleWhileRevalidateSeconds?: number;
    cdnMaxAgeSeconds?: number;
    visibility?: "public" | "private";
  },
): Headers {
  const staleWhileRevalidateSeconds = options?.staleWhileRevalidateSeconds ?? ttlSeconds * 3;
  const cdnMaxAgeSeconds = options?.cdnMaxAgeSeconds ?? staleWhileRevalidateSeconds;
  const visibility = options?.visibility ?? "public";

  return new Headers({
    "Cache-Control": `${visibility}, max-age=${ttlSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    "CDN-Cache-Control": `max-age=${cdnMaxAgeSeconds}`,
  });
}

export function jsonResponse(status: number, body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    status,
    ...init,
  });
}

export function mapRouteError(error: unknown): Response {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return jsonResponse(error.statusCode, {
      error: {
        message: error.message,
        ...("code" in error && typeof error.code === "string" ? { code: error.code } : {}),
      },
    });
  }

  const message = error instanceof Error ? error.message : "CMS route error.";
  logger.error(withError({ message }, error), "Unhandled CMS public route error");

  return jsonResponse(500, {
    error: {
      message,
    },
  });
}

export function getPagination(url: URL) {
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const page = Number(url.searchParams.get("page") ?? "1");

  return {
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export async function listCollection<TCollection extends CollectionSlug>(
  collection: TCollection,
  requestUrl: string,
  options?: {
    depth?: number;
    overrideAccess?: boolean;
    ttlSeconds?: number;
    cacheKey?: string;
  },
): Promise<PaginatedDocs<DataFromCollectionSlug<TCollection>>> {
  const url = new URL(requestUrl);
  const pagination = getPagination(url);
  const depth = options?.depth ?? 1;
  const overrideAccess = options?.overrideAccess ?? true;
  const cacheKey = options?.cacheKey ?? `${collection}:list:${requestUrl}`;

  const fetcher = async () => {
    const payload = await getCmsPayload();

    return payload.find({
      collection,
      depth,
      limit: pagination.limit,
      page: pagination.page,
      overrideAccess,
    });
  };

  if (!options?.ttlSeconds || options.ttlSeconds <= 0) {
    return fetcher();
  }

  return cachedFetch(cacheKey, options.ttlSeconds, fetcher);
}

export function mapPaginatedResult<TDocument, TMapped>(
  result: PaginatedDocs<TDocument>,
  mapper: (document: TDocument) => TMapped,
) {
  return {
    ...result,
    docs: result.docs.map(mapper),
  };
}

export async function findCollectionDocument<TCollection extends CollectionSlug>(
  collection: TCollection,
  identifier: string,
  options?: {
    slugField?: string;
    depth?: number;
    overrideAccess?: boolean;
    ttlSeconds?: number;
    cacheKey?: string;
  },
): Promise<DataFromCollectionSlug<TCollection> | null> {
  const slugField = options?.slugField ?? "slug";
  const depth = options?.depth ?? 1;
  const overrideAccess = options?.overrideAccess ?? true;
  const cacheKey = options?.cacheKey ?? `${collection}:detail:${slugField}:${identifier}`;

  const fetcher = async () => {
    const payload = await getCmsPayload();

    return payload.find({
      collection,
      depth,
      limit: 1,
      overrideAccess,
      where: {
        or: [
          {
            publicId: {
              equals: identifier,
            },
          },
          {
            [slugField]: {
              equals: identifier,
            },
          },
        ],
      },
    });
  };

  const result =
    options?.ttlSeconds && options.ttlSeconds > 0
      ? await cachedFetch(cacheKey, options.ttlSeconds, fetcher)
      : await fetcher();

  return result.docs[0] ?? null;
}

export async function findGlobalDocument<TSlug extends GlobalSlug>(
  slug: TSlug,
  options?: {
    depth?: number;
    overrideAccess?: boolean;
    ttlSeconds?: number;
    cacheKey?: string;
  },
) {
  const depth = options?.depth ?? 1;
  const overrideAccess = options?.overrideAccess ?? true;
  const cacheKey = options?.cacheKey ?? `global:${slug}`;

  const fetcher = async () => {
    const payload = await getCmsPayload();

    return payload.findGlobal({
      slug,
      depth,
      overrideAccess,
    });
  };

  if (!options?.ttlSeconds || options.ttlSeconds <= 0) {
    return fetcher();
  }

  return cachedFetch(cacheKey, options.ttlSeconds, fetcher);
}
