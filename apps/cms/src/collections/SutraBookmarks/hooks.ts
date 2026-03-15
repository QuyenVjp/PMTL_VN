import { upsertBookmark } from "@/services/sutra.service";

type SutraBookmarkHookArgs = {
  data?: Record<string, unknown>;
};

export const sutraBookmarkHooks = {
  beforeChange: [
    ({ data }: SutraBookmarkHookArgs) => {
      return data ? upsertBookmark(data) : data;
    },
  ],
};
