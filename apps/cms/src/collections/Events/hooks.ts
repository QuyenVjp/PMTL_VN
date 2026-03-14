import { revalidateContent } from "@/hooks/revalidate-content";
import { syncEventSearch } from "@/services/search.service";

import { prepareEventData } from "./service";

type EventHookArgs = {
  data?: {
    title?: string | null;
    slug?: string | null;
    startAt?: string | null;
    endAt?: string | null;
  };
  doc?: {
    id: string;
    slug: string;
    title: string;
    summary?: string | null;
    excerpt?: string | null;
  };
  collection?: {
    slug?: string;
  };
};

export const eventHooks = {
  beforeChange: [
    ({ data }: EventHookArgs) => {
      return data ? prepareEventData(data) : data;
    },
  ],
  afterChange: [
    async ({ doc, collection }: EventHookArgs) => {
      if (!doc) {
        return;
      }

      await Promise.all([
        syncEventSearch({
          id: doc.id,
          slug: doc.slug,
          title: doc.title,
          excerpt: doc.summary ?? doc.excerpt ?? "",
        }),
        revalidateContent({
          doc,
          ...(collection ? { collection } : {}),
        }),
      ]);
    },
  ],
};
