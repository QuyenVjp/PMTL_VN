import type { Payload } from "payload";

import { recomputeCommunityCommentCount, submitCommunityComment } from "@/services/community.service";

type CommunityCommentHookArgs = {
  data?: Record<string, unknown>;
  doc?: {
    post?: string | number | { id?: string | number } | null;
  };
  req?: {
    payload: Payload;
  };
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
    async ({ doc, req }: CommunityCommentHookArgs) => {
      const postId = resolvePostId(doc?.post);

      if (!postId || !req?.payload) {
        return;
      }

      await recomputeCommunityCommentCount(req.payload, postId);
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
