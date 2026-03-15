import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { beginnerGuideAccess } from "./access";
import { beginnerGuideFields } from "./fields";
import { beginnerGuideHooks } from "./hooks";

export const BeginnerGuides: CollectionConfig = {
  slug: "beginnerGuides",
  labels: {
    singular: t("Hướng dẫn nhập môn", "Beginner guide"),
    plural: t("Hướng dẫn nhập môn", "Beginner guides"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "guideType", "_status", "order", "updatedAt"],
  },
  access: beginnerGuideAccess,
  hooks: beginnerGuideHooks,
  versions: {
    drafts: true,
  },
  fields: beginnerGuideFields,
};
