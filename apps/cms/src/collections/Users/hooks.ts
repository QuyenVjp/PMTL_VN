import type { Payload } from "payload";

import { appendCollectionAuditLog } from "@/hooks/append-audit-log";
import { ensureUserProfileDefaults, normalizeUserProfileInput } from "./service";

type UserHookArgs = {
  data?: {
    publicId?: string | null;
    fullName?: string | null;
    username?: string | null;
    phone?: string | null;
    bio?: string | null;
  };
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

export const userHooks = {
  beforeChange: [
    ({ data }: UserHookArgs) => {
      if (!data) {
        return data;
      }

      return ensureUserProfileDefaults(normalizeUserProfileInput(data));
    },
  ],
  afterChange: [
    async ({ req, doc, collection, operation }: UserHookArgs) => {
      await appendCollectionAuditLog({
        req,
        doc,
        collection,
        operation,
      });
    },
  ],
};
