import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { tagAccess } from "./access";
import { tagFields } from "./fields";
import { tagHooks } from "./hooks";

export const Tags: CollectionConfig = {
  slug: "tags",
  labels: {
    singular: t("Nhãn", "Tag"),
    plural: t("Nhãn", "Tags"),
  },
  admin: {
    group: t("Nội dung", "Nội dung"),
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "isActive", "updatedAt"],
  },
  access: tagAccess,
  hooks: tagHooks,
  fields: tagFields,
};
