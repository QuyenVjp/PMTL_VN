import type { ContentDocument } from "./types";
import { syncSearchDocument } from "@/integrations/meilisearch/sync-document";

type RelationshipValue = string | number | { id?: string | number; name?: string | null };

type SearchSyncRequest = {
  payload: {
    findByID: (...args: unknown[]) => Promise<unknown>;
  };
};

function isCategoryObject(value: unknown): value is { id?: string | number; name?: string | null } {
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

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

async function resolveRelationshipName(
  collection: "categories" | "tags",
  value: RelationshipValue,
  req?: unknown,
): Promise<string | null> {
  if (isCategoryObject(value) && typeof value.name === "string" && value.name.trim()) {
    return value.name.trim();
  }

  if (!isSearchSyncRequest(req)) {
    return null;
  }

  const rawId = isCategoryObject(value) ? value.id : value;
  if (typeof rawId !== "string" && typeof rawId !== "number") {
    return null;
  }

  try {
    const category = await req.payload.findByID({
      collection,
      id: rawId,
      depth: 0,
    });

    if (isCategoryObject(category) && typeof category.name === "string" && category.name.trim()) {
      return category.name.trim();
    }
  } catch {
    return null;
  }

  return null;
}

export async function syncPostSearch(document: ContentDocument, req?: unknown): Promise<void> {
  const topic = document.topic ? await resolveRelationshipName("categories", document.topic, req) : null;
  const tags = (
    await Promise.all((document.tags ?? []).map((tag) => resolveRelationshipName("tags", tag, req)))
  ).filter((tag): tag is string => Boolean(tag));

  const contentPlainText = document.contentPlainText?.trim() ?? "";
  const normalized = normalizeSearchText(
    [
      document.sourceRef ?? "",
      document.title,
      contentPlainText,
      topic ?? "",
      tags.join(" "),
      document.slug,
    ].join(" "),
  );

  await syncSearchDocument("posts", {
    id: document.id,
    sourceRef: document.sourceRef ?? "",
    title: document.title,
    slug: document.slug,
    excerpt: document.excerpt ?? "",
    contentPlainText,
    topic: topic ?? "",
    tags,
    normalizedSearchText: normalized,
    publishedAt: document.publishedAt ?? null,
    type: "post",
  });
}

export async function syncEventSearch(document: ContentDocument): Promise<void> {
  await syncSearchDocument("events", {
    id: document.id,
    title: document.title,
    slug: document.slug,
    excerpt: document.excerpt ?? "",
    type: "event",
  });
}
