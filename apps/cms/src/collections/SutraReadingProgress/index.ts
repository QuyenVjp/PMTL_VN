import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { sutraReadingProgressAccess } from "./access";
import { sutraReadingProgressFields } from "./fields";
import { sutraReadingProgressHooks } from "./hooks";

export const SutraReadingProgress: CollectionConfig = {
  slug: "sutraReadingProgress",
  labels: {
    singular: t("Tiến độ đọc kinh", "Sutra reading progress"),
    plural: t("Tiến độ đọc kinh", "Sutra reading progress"),
  },
  admin: {
    useAsTitle: "publicId",
    defaultColumns: ["user", "sutra", "scrollPercent", "lastReadAt"],
  },
  access: sutraReadingProgressAccess,
  hooks: sutraReadingProgressHooks,
  fields: sutraReadingProgressFields,
};
