import { prepareHubPageData } from "./service";

import { revalidateContent } from "@/hooks/revalidate-content";

type HubPageHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown>;
  collection?: {
    slug?: string;
  };
};

export const hubPageHooks = {
  beforeChange: [
    ({ data }: HubPageHookArgs) => {
      if (!data) {
        return data;
      }

      return prepareHubPageData(data);
    },
  ],
  afterChange: [
    async ({ doc, collection }: HubPageHookArgs) => {
      if (!doc) {
        return;
      }

      await revalidateContent({
        doc,
        ...(collection ? { collection } : {}),
      });
    },
  ],
  afterDelete: [
    async ({ doc, collection }: HubPageHookArgs) => {
      if (!doc) {
        return;
      }

      await revalidateContent({
        doc,
        ...(collection ? { collection } : {}),
        operation: "delete",
      });
    },
  ],
};
