import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { mediaAccess } from "./access";
import { mediaFields } from "./fields";
import { mediaHooks } from "./hooks";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: t("Media", "Media"),
    plural: t("Thư viện media", "Media"),
  },
  admin: {
    group: t("Tư liệu", "Tư liệu"),
    defaultColumns: ["filename", "alt", "updatedAt"],
    useAsTitle: "filename",
  },
  access: mediaAccess,
  hooks: mediaHooks,
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "application/pdf", "audio/*"],
  },
  fields: mediaFields,
};

