import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { pushJobAccess } from "./access";
import { pushJobFields } from "./fields";
import { pushJobHooks } from "./hooks";

export const PushJobs: CollectionConfig = {
  slug: "pushJobs",
  labels: {
    singular: t("Push job", "Push job"),
    plural: t("Push jobs", "Push jobs"),
  },
  admin: {
    useAsTitle: "publicId",
    defaultColumns: ["kind", "status", "sentCount", "failedCount", "updatedAt"],
  },
  access: pushJobAccess,
  hooks: pushJobHooks,
  fields: pushJobFields,
};
