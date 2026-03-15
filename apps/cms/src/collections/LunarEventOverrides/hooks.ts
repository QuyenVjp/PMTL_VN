import { ensurePublicId } from "@/services/public-id.service";

type LunarEventOverrideHookArgs = {
  data?: Record<string, unknown>;
};

export const lunarEventOverrideHooks = {
  beforeChange: [
    ({ data }: LunarEventOverrideHookArgs) => {
      return data ? ensurePublicId(data, "lno") : data;
    },
  ],
};
