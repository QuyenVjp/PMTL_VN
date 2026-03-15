import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { pushSubscriptionAccess } from "./access";
import { pushSubscriptionFields } from "./fields";
import { pushSubscriptionHooks } from "./hooks";

export const PushSubscriptions: CollectionConfig = {
  slug: "pushSubscriptions",
  labels: {
    singular: t("Đăng ký push", "Push subscription"),
    plural: t("Đăng ký push", "Push subscriptions"),
  },
  admin: {
    useAsTitle: "endpoint",
    defaultColumns: ["user", "isActive", "failedCount", "lastSentAt", "updatedAt"],
  },
  access: pushSubscriptionAccess,
  hooks: pushSubscriptionHooks,
  fields: pushSubscriptionFields,
};
