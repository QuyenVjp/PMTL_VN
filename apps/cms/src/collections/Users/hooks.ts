import { ensureUserProfileDefaults, normalizeUserProfileInput } from "./service";

type UserHookArgs = {
  data?: {
    publicId?: string | null;
    fullName?: string | null;
    username?: string | null;
    phone?: string | null;
    bio?: string | null;
  };
};

export const userHooks = {
  beforeChange: [
    ({ data }: UserHookArgs) => {
      if (!data) {
        return data;
      }

      return ensureUserProfileDefaults(normalizeUserProfileInput(data));
    },
  ],
};
