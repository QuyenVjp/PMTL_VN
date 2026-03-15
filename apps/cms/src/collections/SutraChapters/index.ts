import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { sutraChapterAccess } from "./access";
import { sutraChapterFields } from "./fields";
import { sutraChapterHooks } from "./hooks";

export const SutraChapters: CollectionConfig = {
  slug: "sutraChapters",
  labels: {
    singular: t("Chương kinh", "Sutra chapter"),
    plural: t("Chương kinh", "Sutra chapters"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "sutra", "chapterNumber", "sortOrder", "updatedAt"],
  },
  access: sutraChapterAccess,
  hooks: sutraChapterHooks,
  versions: {
    drafts: true,
  },
  fields: sutraChapterFields,
};
