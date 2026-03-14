import { revalidateContent } from "@/hooks/revalidate-content";
import { syncPostSearch } from "@/services/search.service";
import { wrapLexicalContent } from "@/hooks/lexical-migration";

import { preparePostData } from "./service";

import type { Post } from "@/payload-types";

type PostHookArgs = {
  data?: Record<string, unknown>;
  doc?: Post;
  req?: unknown;
  originalDoc?: Post;
  operation?: "create" | "update";
  collection?: {
    slug?: string;
  };
};

export const postHooks = {
  beforeChange: [
    ({ data, originalDoc, operation }: PostHookArgs) => {
      // Migrate plain text content to Lexical if needed
      if (data?.content && typeof data.content === "string") {
        data.content = wrapLexicalContent(data.content);
      }

      if (data) {
        if (operation === "create") {
          data.viewCount = 0;
        }

        if (operation === "update" && originalDoc) {
          data.viewCount = originalDoc.viewCount ?? 0;
        }

        if (typeof data.sourceUrl === "string") {
          data.sourceUrl = data.sourceUrl.trim();
        }
      }

      return data ? preparePostData(data) : data;
    },
  ],
  afterChange: [
    async ({ doc, collection, req }: PostHookArgs) => {
      if (!doc) {
        return;
      }

      await Promise.all([
        syncPostSearch(doc, req),
        revalidateContent({
          doc,
          ...(collection ? { collection } : {}),
        }),
      ]);
    },
  ],
};
