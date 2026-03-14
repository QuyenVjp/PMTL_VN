import { normalizeUserProfileInput } from "./service";

type UserHookArgs = {
  data?: {
    displayName?: string | null;
    bio?: string | null;
  };
};

export const userHooks = {
  beforeChange: [
    ({ data }: UserHookArgs) => {
      if (!data) {
        return data;
      }

      return normalizeUserProfileInput(data);
    },
  ],
};
