import { prepareSutraChapterData } from "@/services/sutra.service";

type SutraChapterHookArgs = {
  data?: Record<string, unknown>;
};

export const sutraChapterHooks = {
  beforeChange: [
    ({ data }: SutraChapterHookArgs) => {
      return data ? prepareSutraChapterData(data) : data;
    },
  ],
};
