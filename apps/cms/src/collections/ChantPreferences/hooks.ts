import { upsertChantPreferences } from "@/services/chanting.service";

type ChantPreferenceHookArgs = {
  data?: Record<string, unknown>;
};

export const chantPreferenceHooks = {
  beforeChange: [
    ({ data }: ChantPreferenceHookArgs) => {
      return data ? upsertChantPreferences(data) : data;
    },
  ],
};
