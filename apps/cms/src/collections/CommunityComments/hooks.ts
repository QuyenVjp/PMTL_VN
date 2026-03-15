import { appendCollectionAuditLog } from "@/hooks/append-audit-log";
import type { Payload } from "payload";

import { recomputeCommunityCommentCount, submitCommunityComment } from "@/services/community.service";

type CommunityCommentHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown> & {
    post?: string | number | { id?: string | number } | null;
  };
  req?: {
    payload: Payload;
    user?: {
      id?: string | number | null;
      role?: string | null;
    } | null;
  };
  collection?: {
    slug?: string;
  };
  operation?: string;
};

function resolvePostId(value: string | number | { id?: string | number } | null | undefined): string | number | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return value.id ?? null;
}

export const communityCommentHooks = {
  beforeChange: [
    ({ data }: CommunityCommentHookArgs) => {
      return data ? submitCommunityComment(data) : data;
    },
  ],
  afterChange: [
    async ({ doc, req, collection, operation }: CommunityCommentHookArgs) => {
      const postId = resolvePostId(doc?.post);

      if (!postId || !req?.payload) {
        return;
      }

      await Promise.all([
        recomputeCommunityCommentCount(req.payload, postId),
        appendCollectionAuditLog({
          req,
          doc,
          collection,
          operation,
        }),
      ]);
    },
  ],
  afterDelete: [
    async ({ doc, req }: CommunityCommentHookArgs) => {
      const postId = resolvePostId(doc?.post);

      if (!postId || !req?.payload) {
        return;
      }

      await recomputeCommunityCommentCount(req.payload, postId);
    },
  ],
};
