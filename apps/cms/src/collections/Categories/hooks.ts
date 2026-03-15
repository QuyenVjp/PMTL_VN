import { generateCategorySlug, normalizeCategoryData } from "./service";

type CategoryHookArgs = {
  data?: {
    publicId?: string | null;
    name?: string | null;
    slug?: string | null;
    description?: string | null;
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
};

