import { upsertPushSubscription } from "@/services/push.service";

type PushSubscriptionHookArgs = {
  data?: Record<string, unknown>;
};

export const pushSubscriptionHooks = {
  beforeChange: [
    ({ data }: PushSubscriptionHookArgs) => {
      return data ? upsertPushSubscription(data) : data;
    },
  ],
};
