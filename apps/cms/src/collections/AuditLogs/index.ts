import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { auditLogAccess } from "./access";
import { auditLogFields } from "./fields";
import { auditLogHooks } from "./hooks";

export const AuditLogs: CollectionConfig = {
  slug: "auditLogs",
  labels: {
    singular: t("Audit log", "Audit log"),
    plural: t("Audit logs", "Audit logs"),
  },
  admin: {
    useAsTitle: "publicId",
    defaultColumns: ["action", "targetType", "targetPublicId", "createdAt"],
  },
  access: auditLogAccess,
  hooks: auditLogHooks,
  fields: auditLogFields,
};
