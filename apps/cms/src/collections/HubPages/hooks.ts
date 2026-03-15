import { prepareHubPageData } from "./service";

type HubPageHookArgs = {
  data?: Record<string, unknown>;
};

export const hubPageHooks = {
  beforeChange: [
    ({ data }: HubPageHookArgs) => {
      if (!data) {
        return data;
      }

      return prepareHubPageData(data);
    },
  ],
};
