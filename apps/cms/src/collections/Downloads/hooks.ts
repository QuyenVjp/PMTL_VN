import { prepareDownloadData } from "./service";

import { revalidateContent } from "@/hooks/revalidate-content";

type DownloadHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown>;
  collection?: {
    slug?: string;
  };
};

export const downloadHooks = {
  beforeChange: [
    ({ data }: DownloadHookArgs) => {
      if (!data) {
        return data;
      }

      return prepareDownloadData(data);
    },
  ],
  afterChange: [
    async ({ doc, collection }: DownloadHookArgs) => {
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
    async ({ doc, collection }: DownloadHookArgs) => {
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
