import { revalidateContent } from "@/hooks/revalidate-content";

import { prepareEventData, syncEventSearchDocument } from "./service";

type EventHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown>;
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
        syncEventSearchDocument(doc as never),
        revalidateContent({
          doc,
          ...(collection ? { collection } : {}),
        }),
      ]);
    },
  ],
};
