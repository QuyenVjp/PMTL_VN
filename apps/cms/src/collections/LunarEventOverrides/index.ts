import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { lunarEventOverrideAccess } from "./access";
import { lunarEventOverrideFields } from "./fields";
import { lunarEventOverrideHooks } from "./hooks";

export const LunarEventOverrides: CollectionConfig = {
  slug: "lunarEventOverrides",
  labels: {
    singular: t("Override âm lịch", "Lunar override"),
    plural: t("Override âm lịch", "Lunar overrides"),
  },
  admin: {
    useAsTitle: "publicId",
    defaultColumns: ["lunarEvent", "chantItem", "mode", "priority", "updatedAt"],
  },
  access: lunarEventOverrideAccess,
  hooks: lunarEventOverrideHooks,
  fields: lunarEventOverrideFields,
};
