import type { Payload } from "payload";

import { appendCollectionAuditLog } from "@/hooks/append-audit-log";
import { submitGuestbookEntry } from "@/services/community.service";

type GuestbookEntryHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown>;
  req?: {
    payload?: Payload;
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

export const guestbookEntryHooks = {
  beforeChange: [
    ({ data }: GuestbookEntryHookArgs) => {
      return data ? submitGuestbookEntry(data) : data;
    },
  ],
  afterChange: [
    async ({ req, doc, collection, operation }: GuestbookEntryHookArgs) => {
      await appendCollectionAuditLog({
        req,
        doc,
        collection,
        operation,
      });
    },
  ],
};
