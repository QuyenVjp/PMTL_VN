import type { Payload } from "payload";

import { ensurePublicId } from "@/services/public-id.service";
import { buildExcerptFromText, buildSlug, extractLexicalPlainText, normalizeSearchText } from "@/services/content-helpers.service";
import { queueOrSyncPostSearch } from "@/services/search.service";

type PostSource = {
  sourceName?: string | null | undefined;
  sourceTitle?: string | null | undefined;
  sourceUrl?: string | null | undefined;
};

type PostSeries = {
  seriesKey?: string | null | undefined;
  seriesNumber?: number | null | undefined;
};

type PostEventContext = {
  eventDate?: string | null | undefined;
  location?: string | null | undefined;
  relatedEvent?: string | number | { id?: string | number | null } | null | undefined;
};

type PostFlags = {
  featured?: boolean | null | undefined;
  allowComments?: boolean | null | undefined;
};

type PostData = {
  id?: string | number | null | undefined;
  publicId?: string | null | undefined;
  postType?: string | null | undefined;
  sourceRef?: string | null | undefined;
  title?: string | null | undefined;
  content?: unknown;
  excerptOverride?: string | null | undefined;
  excerptComputed?: string | null | undefined;
  slug?: string | null | undefined;
  primaryCategory?: string | number | { id?: string | number | null } | null | undefined;
  categories?: (string | number | { id?: string | number | null })[] | null | undefined;
  tags?: (string | number | { id?: string | number | null })[] | null | undefined;
  coverMedia?: string | number | { id?: string | number | null } | null | undefined;
  gallery?: (string | number | { id?: string | number | null })[] | null | undefined;
  source?: PostSource | null | undefined;
  series?: PostSeries | null | undefined;
  eventContext?: PostEventContext | null | undefined;
  postFlags?: PostFlags | null | undefined;
  relatedPosts?: (string | number | { id?: string | number | null })[] | null | undefined;
  seo?: Record<string, unknown> | null | undefined;
  contentPlainText?: string | null | undefined;
  normalizedSearchText?: string | null | undefined;
  commentCount?: number | null | undefined;
  views?: number | null | undefined;
  uniqueViews?: number | null | undefined;
  likes?: number | null | undefined;
  status?: string | null | undefined;
  _status?: "draft" | "published" | null | undefined;
  publishedAt?: string | null | undefined;
};

function normalizeNumber(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

function normalizeSource(source?: PostSource | null): PostSource {
  return {
    sourceName: source?.sourceName?.trim() ?? "",
    sourceTitle: source?.sourceTitle?.trim() ?? "",
    sourceUrl: source?.sourceUrl?.trim() ?? "",
  };
}

function normalizeSeries(series?: PostSeries | null): PostSeries {
  return {
    seriesKey: series?.seriesKey?.trim() ?? "",
    seriesNumber: typeof series?.seriesNumber === "number" ? series.seriesNumber : null,
  };
}

function normalizeEventContext(eventContext?: PostEventContext | null): PostEventContext {
  return {
    eventDate: eventContext?.eventDate ?? null,
    location: eventContext?.location?.trim() ?? "",
    relatedEvent: eventContext?.relatedEvent ?? null,
  };
}

function normalizeFlags(postFlags?: PostFlags | null): Required<PostFlags> {
  return {
    featured: Boolean(postFlags?.featured),
    allowComments: postFlags?.allowComments ?? true,
  };
}

function extractRelationId(value: unknown): string | number | null {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (value && typeof value === "object" && "id" in value) {
    const relationId = value.id;

    if (typeof relationId === "string" || typeof relationId === "number") {
      return relationId;
    }
  }

  return null;
}

function mapRelationList(values?: (string | number | { id?: string | number | null })[] | null) {
  return (values ?? [])
    .map((value) => extractRelationId(value))
    .filter((value): value is string | number => value !== null);
}

export function generatePostSlug(input: Pick<PostData, "slug" | "title" | "sourceRef">): string | undefined {
  return input.slug?.trim() || buildSlug(input.title, input.sourceRef);
}

export function extractPostPlainText(content: unknown): string {
  return extractLexicalPlainText(content);
}

export function derivePostExcerpt(input: Pick<PostData, "excerptOverride" | "content">): string {
  const override = input.excerptOverride?.trim();

  if (override) {
    return override;
  }

  return buildExcerptFromText(extractPostPlainText(input.content));
}

export function buildNormalizedPostSearchText(input: Pick<PostData, "sourceRef" | "title" | "slug" | "content">): string {
  const plainText = extractPostPlainText(input.content);

  return normalizeSearchText([input.sourceRef, input.title, input.slug, plainText].filter(Boolean).join(" "));
}

export function validatePostTypeConstraints(input: Pick<PostData, "postType" | "sourceRef">): void {
  if (input.postType === "source-note" && !input.sourceRef?.trim()) {
    throw new Error("Source note requires sourceRef.");
  }
}

export function buildPostData(input: PostData): PostData {
  validatePostTypeConstraints(input);

  const plainText = extractPostPlainText(input.content);
  const excerpt = derivePostExcerpt(input);
  const slug = generatePostSlug(input);
  const normalizedText = normalizeSearchText(
    [
      input.sourceRef?.trim() ?? "",
      input.title?.trim() ?? "",
      excerpt,
      plainText,
      slug ?? "",
      input.source?.sourceName ?? "",
      input.source?.sourceTitle ?? "",
    ].join(" "),
  );
  const isPublished = input._status === "published" || input.status === "published";

  return ensurePublicId(
    {
      ...input,
      title: input.title?.trim() ?? input.title,
      sourceRef: input.sourceRef?.trim() ?? "",
      slug,
      excerptComputed: excerpt,
      contentPlainText: plainText,
      normalizedSearchText: normalizedText,
      source: normalizeSource(input.source),
      series: normalizeSeries(input.series),
      eventContext: normalizeEventContext(input.eventContext),
      postFlags: normalizeFlags(input.postFlags),
      commentCount: normalizeNumber(input.commentCount),
      views: normalizeNumber(input.views),
      uniqueViews: normalizeNumber(input.uniqueViews),
      likes: normalizeNumber(input.likes),
      publishedAt: isPublished ? input.publishedAt ?? new Date().toISOString() : null,
    },
    "pst",
  );
}

export function ensurePostCanPublish(input: PostData): void {
  const isPublished = input._status === "published" || input.status === "published";

  if (!isPublished) {
    return;
  }

  if (!input.title?.trim()) {
    throw new Error("Cannot publish a post without title.");
  }

  if (!input.content) {
    throw new Error("Cannot publish a post without content.");
  }
}

export function mapPostToPublicDTO(post: PostData) {
  return {
    id: post.publicId ?? (post.id ? String(post.id) : null),
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerptComputed ?? "",
    publishedAt: post.publishedAt ?? null,
    viewCount: post.views ?? 0,
  };
}

export function mapPostToLegacyDTO(post: PostData) {
  return {
    id: post.publicId ?? (post.id ? String(post.id) : null),
    sourceRef: post.sourceRef ?? "",
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerptComputed ?? "",
    publishedAt: post.publishedAt ?? null,
    topic: extractRelationId(post.primaryCategory),
    tags: mapRelationList(post.tags),
    images: mapRelationList(post.gallery),
    viewCount: post.views ?? 0,
    sourceUrl: post.source?.sourceUrl ?? null,
    content: post.content ?? null,
    contentPlainText: post.contentPlainText ?? "",
    normalizedSearchText: post.normalizedSearchText ?? "",
  };
}

export async function syncPostSearchDocument(document: PostData, req?: unknown): Promise<void> {
  await queueOrSyncPostSearch(
    {
      id: document.publicId ?? document.id ?? "",
      documentId: document.id ? String(document.id) : null,
      slug: document.slug ?? "",
      title: document.title ?? "",
      sourceRef: document.sourceRef ?? "",
      excerpt: document.excerptComputed ?? "",
      contentPlainText: document.contentPlainText ?? "",
      topic: document.primaryCategory ?? null,
      tags: document.tags ?? [],
      publishedAt: document.publishedAt ?? null,
      views: document.views ?? 0,
      featured: document.postFlags?.featured ?? false,
    },
    req,
  );
}

export function incrementPostViewWithCooldown(
  payload: Payload,
  document: PostData & { id: string | number },
  cooldownKey: string,
): PostData {
  void payload;
  void cooldownKey;

  return {
    ...document,
    views: normalizeNumber(document.views) + 1,
  };
}

export async function recomputePostCommentCount(
  payload: Payload,
  postId: string | number,
): Promise<number> {
  const count = await payload.count({
    collection: "postComments",
    overrideAccess: true,
    where: {
      post: {
        equals: postId,
      },
      moderationStatus: {
        equals: "approved",
      },
      isHidden: {
        not_equals: true,
      },
    },
  });

  await payload.update({
    collection: "posts",
    id: postId,
    data: {
      commentCount: count.totalDocs,
    },
    overrideAccess: true,
  });

  return count.totalDocs;
}
