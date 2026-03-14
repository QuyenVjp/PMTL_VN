import { slugify } from "@pmtl/shared";

type CategoryHookArgs = {
  data?: {
    name?: string | null;
    slug?: string | null;
  };
};

export const categoryHooks = {
  beforeChange: [
    ({ data }: CategoryHookArgs) => {
      if (!data) {
        return data;
      }

      return {
        ...data,
        slug: data.slug?.trim() || (data.name ? slugify(data.name) : undefined),
      };
    },
  ],
};

