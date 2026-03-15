import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { chantPreferenceAccess } from "./access";
import { chantPreferenceFields } from "./fields";
import { chantPreferenceHooks } from "./hooks";

export const ChantPreferences: CollectionConfig = {
  slug: "chantPreferences",
  labels: {
    singular: t("Tùy chọn niệm", "Chant preference"),
    plural: t("Tùy chọn niệm", "Chant preferences"),
  },
  admin: {
    group: t("Tu học", "Tu học"),
    useAsTitle: "publicId",
    defaultColumns: ["user", "plan", "updatedAt"],
  },
  access: chantPreferenceAccess,
  hooks: chantPreferenceHooks,
  fields: chantPreferenceFields,
};
