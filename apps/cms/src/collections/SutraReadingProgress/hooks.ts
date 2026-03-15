import { upsertReadingProgress } from "@/services/sutra.service";

type SutraReadingProgressHookArgs = {
  data?: Record<string, unknown>;
};

export const sutraReadingProgressHooks = {
  beforeChange: [
    ({ data }: SutraReadingProgressHookArgs) => {
      return data ? upsertReadingProgress(data) : data;
    },
  ],
};
