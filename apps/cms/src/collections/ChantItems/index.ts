import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { chantItemAccess } from "./access";
import { chantItemFields } from "./fields";
import { chantItemHooks } from "./hooks";

export const ChantItems: CollectionConfig = {
  slug: "chantItems",
  labels: {
    singular: t("Bài niệm", "Chant item"),
    plural: t("Bài niệm", "Chant items"),
  },
  admin: {
    group: t("Tu học", "Tu học"),
    useAsTitle: "title",
    defaultColumns: ["title", "kind", "slug", "updatedAt"],
  },
  access: chantItemAccess,
  hooks: chantItemHooks,
  fields: chantItemFields,
};
