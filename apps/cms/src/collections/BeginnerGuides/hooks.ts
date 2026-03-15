import { prepareBeginnerGuideData } from "./service";

type BeginnerGuideHookArgs = {
  data?: Record<string, unknown>;
};

export const beginnerGuideHooks = {
  beforeChange: [
    ({ data }: BeginnerGuideHookArgs) => {
      if (!data) {
        return data;
      }

      return prepareBeginnerGuideData(data);
    },
  ],
};
