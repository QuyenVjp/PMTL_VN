import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { practiceLogAccess } from "./access";
import { practiceLogFields } from "./fields";
import { practiceLogHooks } from "./hooks";

export const PracticeLogs: CollectionConfig = {
  slug: "practiceLogs",
  labels: {
    singular: t("Nhật ký công phu", "Practice log"),
    plural: t("Nhật ký công phu", "Practice logs"),
  },
  admin: {
    useAsTitle: "publicId",
    defaultColumns: ["user", "plan", "practiceDate", "isCompleted", "updatedAt"],
  },
  access: practiceLogAccess,
  hooks: practiceLogHooks,
  fields: practiceLogFields,
};
