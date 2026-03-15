import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { requestGuardAccess } from "./access";
import { requestGuardFields } from "./fields";
import { requestGuardHooks } from "./hooks";

export const RequestGuards: CollectionConfig = {
  slug: "requestGuards",
  labels: {
    singular: t("Request guard", "Request guard"),
    plural: t("Request guards", "Request guards"),
  },
  admin: {
    useAsTitle: "guardKey",
    defaultColumns: ["guardKey", "scope", "hits", "expiresAt", "lastSeenAt"],
  },
  access: requestGuardAccess,
  hooks: requestGuardHooks,
  fields: requestGuardFields,
};
