import { prepareSutraData } from "@/services/sutra.service";

type SutraHookArgs = {
  data?: Record<string, unknown>;
};

export const sutraHooks = {
  beforeChange: [
    ({ data }: SutraHookArgs) => {
      return data ? prepareSutraData(data) : data;
    },
  ],
};
