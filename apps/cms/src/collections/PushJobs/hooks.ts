import { appendCollectionAuditLog } from "@/hooks/append-audit-log";
import type { Payload } from "payload";

import { createPushJob } from "@/services/push.service";
import { enqueuePushDispatchJob } from "@/services/queue.service";

type PushJobHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown> & {
    id?: string | number;
    status?: string | null;
  };
  req?: {
    payload: Payload;
    user?: {
      id?: string | number | null;
      role?: string | null;
    } | null;
  };
  collection?: {
    slug?: string;
  };
  operation?: string;
};

export const pushJobHooks = {
  beforeChange: [
    ({ data }: PushJobHookArgs) => {
      return data ? createPushJob(data) : data;
    },
  ],
  afterChange: [
    async ({ doc, req, collection, operation }: PushJobHookArgs) => {
      if (!doc?.id || doc.status !== "pending" && doc.status !== "queued") {
        return;
      }

      await Promise.all([
        enqueuePushDispatchJob(doc.id),
        appendCollectionAuditLog({
          req,
          doc,
          collection,
          operation,
        }),
      ]);
    },
  ],
};
