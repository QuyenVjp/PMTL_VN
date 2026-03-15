import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { lunarEventAccess } from "./access";
import { lunarEventFields } from "./fields";
import { lunarEventHooks } from "./hooks";

export const LunarEvents: CollectionConfig = {
  slug: "lunarEvents",
  labels: {
    singular: t("Sự kiện âm lịch", "Lunar event"),
    plural: t("Sự kiện âm lịch", "Lunar events"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "eventType", "priority", "updatedAt"],
  },
  access: lunarEventAccess,
  hooks: lunarEventHooks,
  fields: lunarEventFields,
};
