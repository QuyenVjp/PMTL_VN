import { wrapLexicalContent } from "@/hooks/lexical-migration";
import { revalidateContent } from "@/hooks/revalidate-content";
import {
  preparePostData,
  syncPostSearchDocument,
} from "./service";

type PostHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown>;
  req?: unknown;
  originalDoc?: Record<string, unknown>;
  operation?: "create" | "update";
  collection?: {
    slug?: string;
  };
};

export const postHooks = {
  beforeChange: [
    ({ data, originalDoc, operation }: PostHookArgs) => {
      if (!data) {
        return data;
      }

      if (typeof data.content === "string") {
        data.content = wrapLexicalContent(data.content);
      }

      if (operation === "create") {
        data.commentCount = 0;
        data.views = 0;
        data.uniqueViews = 0;
        data.likes = 0;
      }

      if (operation === "update" && originalDoc) {
        data.commentCount = data.commentCount ?? originalDoc.commentCount ?? 0;
        data.views = data.views ?? originalDoc.views ?? 0;
        data.uniqueViews = data.uniqueViews ?? originalDoc.uniqueViews ?? 0;
        data.likes = data.likes ?? originalDoc.likes ?? 0;
      }

      return preparePostData(data);
    },
  ],
  afterChange: [
    async ({ doc, collection, req }: PostHookArgs) => {
      if (!doc) {
        return;
      }

      await Promise.all([
        syncPostSearchDocument(doc as never, req),
        revalidateContent({
          doc,
          ...(collection ? { collection } : {}),
        }),
      ]);
    },
  ],
};
