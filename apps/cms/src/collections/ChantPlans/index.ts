import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { chantPlanAccess } from "./access";
import { chantPlanFields } from "./fields";
import { chantPlanHooks } from "./hooks";

export const ChantPlans: CollectionConfig = {
  slug: "chantPlans",
  labels: {
    singular: t("Kế hoạch niệm", "Chant plan"),
    plural: t("Kế hoạch niệm", "Chant plans"),
  },
  admin: {
    group: t("Tu học", "Tu học"),
    useAsTitle: "title",
    defaultColumns: ["title", "planType", "slug", "updatedAt"],
  },
  access: chantPlanAccess,
  hooks: chantPlanHooks,
  fields: chantPlanFields,
};
