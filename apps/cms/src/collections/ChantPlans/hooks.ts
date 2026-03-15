import { prepareChantPlanData } from "@/services/chanting.service";

type ChantPlanHookArgs = {
  data?: Record<string, unknown>;
};

export const chantPlanHooks = {
  beforeChange: [
    ({ data }: ChantPlanHookArgs) => {
      return data ? prepareChantPlanData(data) : data;
    },
  ],
};
