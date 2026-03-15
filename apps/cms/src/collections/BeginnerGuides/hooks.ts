import { prepareBeginnerGuideData } from "./service";

import { revalidateContent } from "@/hooks/revalidate-content";

type BeginnerGuideHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown>;
  collection?: {
    slug?: string;
  };
};

export const beginnerGuideHooks = {
  beforeChange: [
    ({ data }: BeginnerGuideHookArgs) => {
      if (!data) {
        return data;
      }

      return prepareBeginnerGuideData(data);
    },
  ],
  afterChange: [
    async ({ doc, collection }: BeginnerGuideHookArgs) => {
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
    async ({ doc, collection }: BeginnerGuideHookArgs) => {
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
