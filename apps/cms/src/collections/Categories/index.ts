import type { CollectionConfig } from "payload";

import { categoryAccess } from "./access";
import { categoryFields } from "./fields";
import { categoryHooks } from "./hooks";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    singular: "Category",
    plural: "Categories",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug"],
  },
  access: categoryAccess,
  hooks: categoryHooks,
  fields: categoryFields,
};

