import type { Payload } from "payload";

import { appendCollectionAuditLog } from "@/hooks/append-audit-log";
import { revalidateContent } from "@/hooks/revalidate-content";
import { submitCommunityPost } from "@/services/community.service";

type CommunityPostHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown>;
  collection?: {
    slug?: string;
  };
  req?: {
    payload?: Payload;
    user?: {
      id?: string | number | null;
      role?: string | null;
    } | null;
  };
  operation?: string;
};

export const communityPostHooks = {
  beforeChange: [
    ({ data }: CommunityPostHookArgs) => {
      return data ? submitCommunityPost(data) : data;
    },
  ],
  afterChange: [
    async ({ doc, collection, req, operation }: CommunityPostHookArgs) => {
      if (!doc) {
        return;
      }

      await Promise.all([
        revalidateContent({
          doc,
          ...(collection ? { collection } : {}),
        }),
        appendCollectionAuditLog({
          req,
          doc,
          collection,
          operation,
        }),
      ]);
    },
  ],
};
