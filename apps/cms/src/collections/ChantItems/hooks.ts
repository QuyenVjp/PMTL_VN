import { prepareChantItemData } from "@/services/chanting.service";

type ChantItemHookArgs = {
  data?: Record<string, unknown>;
};

export const chantItemHooks = {
  beforeChange: [
    ({ data }: ChantItemHookArgs) => {
      return data ? prepareChantItemData(data) : data;
    },
  ],
};
