import { prepareSutraVolumeData } from "@/services/sutra.service";

type SutraVolumeHookArgs = {
  data?: Record<string, unknown>;
};

export const sutraVolumeHooks = {
  beforeChange: [
    ({ data }: SutraVolumeHookArgs) => {
      return data ? prepareSutraVolumeData(data) : data;
    },
  ],
};
