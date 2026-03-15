import { getPayload } from "payload";
import type { CollectionSlug, DataFromCollectionSlug, PaginatedDocs } from "payload";

import config from "@/payload.config";

export async function getCmsPayload() {
  return getPayload({
    config,
  });
}

export function jsonResponse(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
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
): Promise<PaginatedDocs<DataFromCollectionSlug<TCollection>>> {
  const payload = await getCmsPayload();
  const url = new URL(requestUrl);
  const pagination = getPagination(url);

  return payload.find({
    collection,
    depth: 1,
    limit: pagination.limit,
    page: pagination.page,
  });
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
  },
): Promise<DataFromCollectionSlug<TCollection> | null> {
  const payload = await getCmsPayload();
  const slugField = options?.slugField ?? "slug";

  const result = await payload.find({
    collection,
    depth: 1,
    limit: 1,
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

  return result.docs[0] ?? null;
}
