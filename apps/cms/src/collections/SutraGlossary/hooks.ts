import { ensurePublicId } from "@/services/public-id.service";

type SutraGlossaryHookArgs = {
  data?: Record<string, unknown>;
};

export const sutraGlossaryHooks = {
  beforeChange: [
    ({ data }: SutraGlossaryHookArgs) => {
      return data ? ensurePublicId(data, "sug") : data;
    },
  ],
};
