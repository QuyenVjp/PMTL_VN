import type { Payload } from "payload";
import { commentCreateSchema } from "@pmtl/shared";

import { ensurePublicId } from "@/services/public-id.service";

type CommentInput = {
  id?: string | number | null | undefined;
  publicId?: string | null | undefined;
  post?: string | number | { id?: string | number | null } | null | undefined;
  parent?: string | number | { id?: string | number | null } | null | undefined;
  content?: string | null | undefined;
  authorName?: string | null | undefined;
  authorEmail?: string | null | undefined;
  authorAvatar?: string | null | undefined;
  badge?: string | null | undefined;
  isOfficialReply?: boolean | null | undefined;
  submittedByUser?: string | number | { id?: string | number | null } | null | undefined;
  submittedByIpHash?: string | null | undefined;
  moderationStatus?: "pending" | "approved" | "rejected" | "flagged" | "hidden" | null | undefined;
  spamScore?: number | null | undefined;
  reportCount?: number | null | undefined;
  lastReportReason?: string | null | undefined;
  isHidden?: boolean | null | undefined;
};

function normalizeScore(value?: number | null): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
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

export function validateCommentInput(input: CommentInput): void {
  commentCreateSchema.parse({
    postId: extractRelationId(input.post),
    authorName: input.authorName ?? "",
    authorEmail: input.authorEmail ?? "guest@pmtl.local",
    content: input.content ?? "",
  });
}

export function sanitizeCommentContent(content?: string | null): string {
  return content?.replace(/\s+/g, " ").trim() ?? "";
}

export function scoreCommentSpam(input: Pick<CommentInput, "content">): number {
  const content = sanitizeCommentContent(input.content);

  if (!content) {
    return 100;
  }

  let score = 0;

  if (content.length < 4) {
    score += 30;
  }

  if ((content.match(/https?:\/\//g) ?? []).length > 1) {
    score += 40;
  }

  if (/(.)\1{7,}/.test(content)) {
    score += 20;
  }

  return score;
}

export function buildCommentData(input: CommentInput): CommentInput {
  const moderationStatus = input.moderationStatus ?? "pending";
  const spamScore = scoreCommentSpam(input);

  return ensurePublicId(
    {
      ...input,
      content: sanitizeCommentContent(input.content),
      authorName: input.authorName?.trim() ?? "Khách",
      authorAvatar: input.authorAvatar?.trim() ?? "",
      badge: input.badge?.trim() ?? "",
      moderationStatus,
      spamScore,
      reportCount: normalizeScore(input.reportCount),
      isHidden: Boolean(input.isHidden),
      isOfficialReply: Boolean(input.isOfficialReply),
    },
    "cmt",
  );
}

export async function submitPostComment(payload: Payload, input: CommentInput) {
  validateCommentInput(input);

  return payload.create({
    collection: "postComments",
    data: buildCommentData(input) as never,
    overrideAccess: true,
  });
}

export async function moderateComment(
  payload: Payload,
  commentId: string | number,
  moderationStatus: NonNullable<CommentInput["moderationStatus"]>,
) {
  return payload.update({
    collection: "postComments",
    id: commentId,
    data: {
      moderationStatus,
      isHidden: moderationStatus === "hidden" || moderationStatus === "rejected",
    },
    overrideAccess: true,
  });
}

export async function recomputePostCommentCount(payload: Payload, postId: string | number): Promise<number> {
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

export function mapCommentToPublicDTO<T extends CommentInput & { createdAt?: string | null | undefined; updatedAt?: string | null | undefined }>(
  comment: T,
) {
  return {
    id: comment.publicId ?? (comment.id ? String(comment.id) : null),
    post: extractRelationId(comment.post) || null,
    parent: extractRelationId(comment.parent) || null,
    content: comment.content ?? "",
    authorName: comment.authorName ?? "Khách",
    authorAvatar: comment.authorAvatar ?? "",
    badge: comment.badge ?? "",
    isOfficialReply: Boolean(comment.isOfficialReply),
    createdAt: comment.createdAt ?? null,
    updatedAt: comment.updatedAt ?? null,
  };
}

export function buildCommentTreeDTO<T>(comments: T[]): T[] {
  return comments;
}
