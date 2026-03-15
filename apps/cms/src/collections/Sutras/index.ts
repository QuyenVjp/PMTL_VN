import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { sutraAccess } from "./access";
import { sutraFields } from "./fields";
import { sutraHooks } from "./hooks";

export const Sutras: CollectionConfig = {
  slug: "sutras",
  labels: {
    singular: t("Kinh", "Sutra"),
    plural: t("Kinh", "Sutras"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "isFeatured", "sortOrder", "updatedAt"],
  },
  access: sutraAccess,
  hooks: sutraHooks,
  versions: {
    drafts: true,
  },
  fields: sutraFields,
};
