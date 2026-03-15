import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { moderationReportAccess } from "./access";
import { moderationReportFields } from "./fields";
import { moderationReportHooks } from "./hooks";

export const ModerationReports: CollectionConfig = {
  slug: "moderationReports",
  labels: {
    singular: t("Báo cáo kiểm duyệt", "Moderation report"),
    plural: t("Báo cáo kiểm duyệt", "Moderation reports"),
  },
  admin: {
    group: t("Hệ thống", "Hệ thống"),
    useAsTitle: "publicId",
    defaultColumns: ["entityType", "entityPublicId", "reason", "status", "updatedAt"],
  },
  access: moderationReportAccess,
  hooks: moderationReportHooks,
  fields: moderationReportFields,
};
