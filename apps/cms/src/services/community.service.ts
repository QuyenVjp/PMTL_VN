import type { Payload } from "payload";

import { ensurePublicId } from "@/services/public-id.service";

type CommunityPostInput = {
  publicId?: string | null | undefined;
  title?: string | null | undefined;
  content?: string | null | undefined;
  type?: string | null | undefined;
  slug?: string | null | undefined;
  videoURL?: string | null | undefined;
  category?: string | null | undefined;
  tags?: { value?: string | null | undefined }[] | string[] | null | undefined;
  rating?: number | null | undefined;
  authorNameSnapshot?: string | null | undefined;
  likes?: number | null | undefined;
  views?: number | null | undefined;
  commentsCount?: number | null | undefined;
  pinned?: boolean | null | undefined;
  moderationStatus?: "pending" | "approved" | "rejected" | "flagged" | "hidden" | null | undefined;
  spamScore?: number | null | undefined;
  reportCount?: number | null | undefined;
  lastReportReason?: string | null | undefined;
  isHidden?: boolean | null | undefined;
};

type CommunityCommentInput = {
  publicId?: string | null | undefined;
  content?: string | null | undefined;
  authorNameSnapshot?: string | null | undefined;
  likes?: number | null | undefined;
  moderationStatus?: "pending" | "approved" | "rejected" | "flagged" | "hidden" | null | undefined;
  spamScore?: number | null | undefined;
  reportCount?: number | null | undefined;
  lastReportReason?: string | null | undefined;
  isHidden?: boolean | null | undefined;
};

type GuestbookInput = {
  publicId?: string | null | undefined;
  authorName?: string | null | undefined;
  message?: string | null | undefined;
  country?: string | null | undefined;
  avatar?: string | null | undefined;
  entryType?: string | null | undefined;
  questionCategory?: string | null | undefined;
  adminReply?: string | null | undefined;
  badge?: string | null | undefined;
  approvalStatus?: "pending" | "approved" | "rejected" | null | undefined;
  isAnswered?: boolean | null | undefined;
  submittedByIpHash?: string | null | undefined;
};

function normalizeNumber(value?: number | null): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

function sanitizeText(value?: string | null): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function scoreSpam(content?: string | null): number {
  const sanitized = sanitizeText(content);

  if (!sanitized) {
    return 100;
  }

  let score = 0;

  if ((sanitized.match(/https?:\/\//g) ?? []).length > 1) {
    score += 40;
  }

  if (sanitized.length < 6) {
    score += 20;
  }

  if (/(.)\1{8,}/.test(sanitized)) {
    score += 20;
  }

  return score;
}

function normalizeTextArray(value?: { value?: string | null | undefined }[] | string[] | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item : item.value))
    .map((item) => sanitizeText(item))
    .filter(Boolean);
}

function normalizeTagItems(
  value?: { value?: string | null | undefined }[] | string[] | null,
): Array<{ value: string }> {
  return normalizeTextArray(value).map((item) => ({
    value: item,
  }));
}

function extractRelationId(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "id" in value) {
    const relationId = value.id;

    if (typeof relationId === "string" || typeof relationId === "number") {
      return String(relationId);
    }
  }

  return "";
}

export function submitCommunityPost<T extends CommunityPostInput>(input: T): T {
  const content = sanitizeText(input.content);

  return ensurePublicId(
    {
      ...input,
      title: sanitizeText(input.title),
      content,
      type: sanitizeText(input.type) || "story",
      slug: sanitizeText(input.slug),
      videoURL: sanitizeText(input.videoURL),
      category: sanitizeText(input.category),
      tags: normalizeTagItems(input.tags),
      rating: normalizeNumber(input.rating),
      authorNameSnapshot: sanitizeText(input.authorNameSnapshot),
      likes: normalizeNumber(input.likes),
      views: normalizeNumber(input.views),
      commentsCount: normalizeNumber(input.commentsCount),
      pinned: Boolean(input.pinned),
      moderationStatus: input.moderationStatus ?? "pending",
      spamScore: scoreSpam(content),
      reportCount: normalizeNumber(input.reportCount),
      lastReportReason: sanitizeText(input.lastReportReason),
      isHidden: Boolean(input.isHidden),
    },
    "ugc",
  ) as T;
}

export function submitCommunityComment<T extends CommunityCommentInput>(input: T): T {
  const content = sanitizeText(input.content);

  return ensurePublicId(
    {
      ...input,
      content,
      authorNameSnapshot: sanitizeText(input.authorNameSnapshot),
      likes: normalizeNumber(input.likes),
      moderationStatus: input.moderationStatus ?? "pending",
      spamScore: scoreSpam(content),
      reportCount: normalizeNumber(input.reportCount),
      lastReportReason: sanitizeText(input.lastReportReason),
      isHidden: Boolean(input.isHidden),
    },
    "ugc",
  ) as T;
}

export async function moderateCommunityEntity(
  payload: Payload,
  collection: "communityPosts" | "communityComments" | "guestbookEntries",
  id: string | number,
  moderationStatus: "approved" | "rejected" | "flagged" | "hidden",
) {
  const data =
    collection === "guestbookEntries"
      ? {
          approvalStatus: moderationStatus === "approved" ? "approved" : moderationStatus === "rejected" ? "rejected" : "pending",
        }
      : {
          moderationStatus,
          isHidden: moderationStatus === "hidden" || moderationStatus === "rejected",
        };

  return payload.update({
    collection,
    id,
    data,
    overrideAccess: true,
  });
}

export async function recomputeCommunityCommentCount(payload: Payload, postId: string | number): Promise<number> {
  const count = await payload.count({
    collection: "communityComments",
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
    collection: "communityPosts",
    id: postId,
    data: {
      commentsCount: count.totalDocs,
    },
    overrideAccess: true,
  });

  return count.totalDocs;
}

export function submitGuestbookEntry<T extends GuestbookInput>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      authorName: sanitizeText(input.authorName),
      message: sanitizeText(input.message),
      country: sanitizeText(input.country),
      avatar: sanitizeText(input.avatar),
      entryType: sanitizeText(input.entryType) || "gratitude",
      questionCategory: sanitizeText(input.questionCategory),
      adminReply: sanitizeText(input.adminReply),
      badge: sanitizeText(input.badge),
      approvalStatus: input.approvalStatus ?? "pending",
      isAnswered: Boolean(input.isAnswered),
      submittedByIpHash: sanitizeText(input.submittedByIpHash),
    },
    "gbk",
  ) as T;
}

export async function approveGuestbookEntry(payload: Payload, id: string | number) {
  return payload.update({
    collection: "guestbookEntries",
    id,
    data: {
      approvalStatus: "approved",
    },
    overrideAccess: true,
  });
}

export async function replyGuestbookEntry(payload: Payload, id: string | number, adminReply: string) {
  return payload.update({
    collection: "guestbookEntries",
    id,
    data: {
      adminReply: sanitizeText(adminReply),
      isAnswered: true,
    },
    overrideAccess: true,
  });
}

export function incrementCommunityPostView<T extends { views?: number | null | undefined }>(document: T): T {
  return {
    ...document,
    views: normalizeNumber(document.views) + 1,
  };
}

export function mapCommunityPostToPublicDTO<
  T extends {
    publicId?: string | null | undefined;
    title?: string | null | undefined;
    content?: string | null | undefined;
    slug?: string | null | undefined;
    type?: string | null | undefined;
    likes?: number | null | undefined;
    views?: number | null | undefined;
    commentsCount?: number | null | undefined;
    authorNameSnapshot?: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
  },
>(post: T) {
  return {
    id: post.publicId ?? null,
    title: post.title ?? "",
    content: post.content ?? "",
    slug: post.slug ?? "",
    type: post.type ?? "",
    authorName: post.authorNameSnapshot ?? "Ẩn danh",
    likes: normalizeNumber(post.likes),
    views: normalizeNumber(post.views),
    commentsCount: normalizeNumber(post.commentsCount),
    createdAt: post.createdAt ?? null,
    updatedAt: post.updatedAt ?? null,
  };
}

export function mapCommunityCommentToDTO<
  T extends {
    publicId?: string | null | undefined;
    content?: string | null | undefined;
    authorNameSnapshot?: string | null | undefined;
    likes?: number | null | undefined;
    parent?: string | number | { id?: string | number | null } | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
  },
>(comment: T) {
  return {
    id: comment.publicId ?? null,
    content: comment.content ?? "",
    authorName: comment.authorNameSnapshot ?? "Ẩn danh",
    likes: normalizeNumber(comment.likes),
    parent: extractRelationId(comment.parent) || null,
    createdAt: comment.createdAt ?? null,
    updatedAt: comment.updatedAt ?? null,
  };
}

export function mapGuestbookEntryToPublicDTO<
  T extends {
    publicId?: string | null | undefined;
    authorName?: string | null | undefined;
    message?: string | null | undefined;
    country?: string | null | undefined;
    avatar?: string | null | undefined;
    badge?: string | null | undefined;
    adminReply?: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
  },
>(entry: T) {
  return {
    id: entry.publicId ?? null,
    authorName: entry.authorName ?? "Khách",
    message: entry.message ?? "",
    country: entry.country ?? "",
    avatar: entry.avatar ?? "",
    badge: entry.badge ?? "",
    adminReply: entry.adminReply ?? "",
    createdAt: entry.createdAt ?? null,
    updatedAt: entry.updatedAt ?? null,
  };
}
