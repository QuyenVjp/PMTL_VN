import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { downloadAccess } from "./access";
import { downloadFields } from "./fields";
import { downloadHooks } from "./hooks";

export const Downloads: CollectionConfig = {
  slug: "downloads",
  labels: {
    singular: t("Tệp tải về", "Download"),
    plural: t("Tệp tải về", "Downloads"),
  },
  admin: {
    group: t("Nội dung", "Nội dung"),
    useAsTitle: "title",
    defaultColumns: ["title", "fileType", "_status", "groupYear", "updatedAt"],
  },
  access: downloadAccess,
  hooks: downloadHooks,
  versions: {
    drafts: true,
  },
  fields: downloadFields,
};
