import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { hubPageAccess } from "./access";
import { hubPageFields } from "./fields";
import { hubPageHooks } from "./hooks";

export const HubPages: CollectionConfig = {
  slug: "hubPages",
  labels: {
    singular: t("Trang hub", "Hub page"),
    plural: t("Trang hub", "Hub pages"),
  },
  admin: {
    group: t("Nội dung", "Nội dung"),
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "showInMenu", "updatedAt"],
  },
  access: hubPageAccess,
  hooks: hubPageHooks,
  versions: {
    drafts: true,
  },
  fields: hubPageFields,
};
