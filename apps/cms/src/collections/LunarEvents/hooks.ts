import { ensurePublicId } from "@/services/public-id.service";

type LunarEventHookArgs = {
  data?: Record<string, unknown>;
};

export const lunarEventHooks = {
  beforeChange: [
    ({ data }: LunarEventHookArgs) => {
      return data ? ensurePublicId(data, "lne") : data;
    },
  ],
};
