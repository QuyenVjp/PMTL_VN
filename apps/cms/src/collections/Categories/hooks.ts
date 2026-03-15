import { generateCategorySlug, normalizeCategoryData } from "./service";

import { revalidateContent } from "@/hooks/revalidate-content";

type CategoryHookArgs = {
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

export const categoryHooks = {
  beforeChange: [
    ({ data }: CategoryHookArgs) => {
      if (!data) {
        return data;
      }

      return normalizeCategoryData({
        ...data,
        slug: generateCategorySlug(data),
      });
    },
  ],
  afterChange: [
    async ({ doc, collection }: CategoryHookArgs) => {
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
    async ({ doc, collection }: CategoryHookArgs) => {
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

