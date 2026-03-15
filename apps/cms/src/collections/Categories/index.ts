import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { categoryAccess } from "./access";
import { categoryFields } from "./fields";
import { categoryHooks } from "./hooks";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    singular: t("Chủ đề", "Category"),
    plural: t("Chủ đề", "Categories"),
  },
  admin: {
    group: t("Nội dung", "Nội dung"),
    defaultColumns: ["name", "slug", "order", "isActive", "updatedAt"],
    useAsTitle: "name",
  },
  access: categoryAccess,
  hooks: categoryHooks,
  fields: categoryFields,
};

