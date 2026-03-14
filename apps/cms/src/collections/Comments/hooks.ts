import { notifyCommentModeration } from "@/services/notification.service";

import { prepareCommentData } from "./service";

type CommentHookArgs = {
  data?: {
    post?: string;
    authorName?: string;
    authorEmail?: string;
    content?: string;
    status?: string;
  };
  doc?: {
    id: string;
    status: string;
  };
};

export const commentHooks = {
  beforeChange: [
    ({ data }: CommentHookArgs) => {
      return data ? prepareCommentData(data) : data;
    },
  ],
  afterChange: [
    async ({ doc }: CommentHookArgs) => {
      if (!doc) {
        return;
      }

      await notifyCommentModeration(doc.id, doc.status);
    },
  ],
};

