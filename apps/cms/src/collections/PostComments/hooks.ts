import type { Payload } from "payload";

import { recomputePostCommentCount } from "@/services/comment.service";

import { preparePostCommentData } from "./service";

type PostCommentHookArgs = {
  data?: Record<string, unknown>;
  doc?: {
    id?: string | number;
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

export const postCommentHooks = {
  beforeChange: [
    ({ data }: PostCommentHookArgs) => {
      if (!data) {
        return data;
      }

      return preparePostCommentData(data);
    },
  ],
  afterChange: [
    async ({ doc, req }: PostCommentHookArgs) => {
      const postId = resolvePostId(doc?.post);

      if (!postId || !req?.payload) {
        return;
      }

      await recomputePostCommentCount(req.payload, postId);
    },
  ],
  afterDelete: [
    async ({ doc, req }: PostCommentHookArgs) => {
      const postId = resolvePostId(doc?.post);

      if (!postId || !req?.payload) {
        return;
      }

      await recomputePostCommentCount(req.payload, postId);
    },
  ],
};
