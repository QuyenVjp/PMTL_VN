import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { sutraBookmarkAccess } from "./access";
import { sutraBookmarkFields } from "./fields";
import { sutraBookmarkHooks } from "./hooks";

export const SutraBookmarks: CollectionConfig = {
  slug: "sutraBookmarks",
  labels: {
    singular: t("Đánh dấu kinh", "Sutra bookmark"),
    plural: t("Đánh dấu kinh", "Sutra bookmarks"),
  },
  admin: {
    group: t("Tu học", "Tu học"),
    useAsTitle: "publicId",
    defaultColumns: ["user", "sutra", "updatedAt"],
  },
  access: sutraBookmarkAccess,
  hooks: sutraBookmarkHooks,
  fields: sutraBookmarkFields,
};
