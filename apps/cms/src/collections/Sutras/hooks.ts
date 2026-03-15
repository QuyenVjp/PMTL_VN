import { revalidateContent } from "@/hooks/revalidate-content";
import { prepareSutraData } from "@/services/sutra.service";

type SutraHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown>;
  collection?: {
    slug?: string;
  };
};

export const sutraHooks = {
  beforeChange: [
    ({ data }: SutraHookArgs) => {
      return data ? prepareSutraData(data) : data;
    },
  ],
  afterChange: [
    async ({ doc, collection }: SutraHookArgs) => {
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
    async ({ doc, collection }: SutraHookArgs) => {
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
