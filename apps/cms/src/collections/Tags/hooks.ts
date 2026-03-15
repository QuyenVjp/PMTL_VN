import { generateTagSlug, normalizeTagData } from "./service";

type TagHookArgs = {
  data?: {
    publicId?: string | null;
    name?: string | null;
    slug?: string | null;
    description?: string | null;
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
};
