import type { Payload } from "payload";

import { createPushJob, enqueuePushDispatch } from "@/services/push.service";

type PushJobHookArgs = {
  data?: Record<string, unknown>;
  doc?: {
    id?: string | number;
    status?: string | null;
  };
  req?: {
    payload: Payload;
  };
};

export const pushJobHooks = {
  beforeChange: [
    ({ data }: PushJobHookArgs) => {
      return data ? createPushJob(data) : data;
    },
  ],
  afterChange: [
    async ({ doc, req }: PushJobHookArgs) => {
      if (!doc?.id || !req?.payload || doc.status !== "pending") {
        return;
      }

      await enqueuePushDispatch(req.payload, doc.id);
    },
  ],
};
