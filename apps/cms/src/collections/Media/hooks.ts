import { ensureMediaDefaults } from "./service";

type MediaHookArgs = {
  data?: {
    publicId?: string | null;
    alt?: string | null;
    filename?: string | null;
  };
};

export const mediaHooks = {
  beforeChange: [
    ({ data }: MediaHookArgs) => {
      if (!data) {
        return data;
      }

      return ensureMediaDefaults(data);
    },
  ],
};

