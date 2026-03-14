import { wrapLexicalContent } from "@/hooks/lexical-migration";
import { revalidateContent } from "@/hooks/revalidate-content";
import { syncPostSearch } from "@/services/search.service";

import { preparePostData } from "./service";

import type { Post } from "@/payload-types";

type PostHookArgs = {
  data?: Record<string, unknown>;
  doc?: Post;
  collection?: {
    slug?: string;
  };
};

export const postHooks = {
  beforeChange: [
    ({ data }: PostHookArgs) => {
      // Migrate plain text content to Lexical if needed
      if (data?.content && typeof data.content === "string") {
        data.content = wrapLexicalContent(data.content);
      }
      return data ? preparePostData(data) : data;
    },
  ],
  afterChange: [
    async ({ doc, collection }: PostHookArgs) => {
      if (!doc) {
        return;
      }

      await Promise.all([
        syncPostSearch(doc),
        revalidateContent({
          doc,
          ...(collection ? { collection } : {}),
        }),
      ]);
    },
  ],
};
