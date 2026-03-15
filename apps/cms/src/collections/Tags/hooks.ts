import { generateTagSlug, normalizeTagData } from "./service";

import { revalidateContent } from "@/hooks/revalidate-content";

type TagHookArgs = {
  data?: {
    publicId?: string | null;
    name?: string | null;
    slug?: string | null;
    description?: string | null;
  };
  doc?: {
    id?: string | number | null;
    publicId?: string | null;
    slug?: string | null;
  };
  collection?: {
    slug?: string;
  };
};

export const tagHooks = {
  beforeChange: [
    ({ data }: TagHookArgs) => {
      if (!data) {
        return data;
      }

      return normalizeTagData({
        ...data,
        slug: generateTagSlug(data),
      });
    },
  ],
  afterChange: [
    async ({ doc, collection }: TagHookArgs) => {
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
    async ({ doc, collection }: TagHookArgs) => {
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
