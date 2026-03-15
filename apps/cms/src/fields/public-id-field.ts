import type { Field } from "payload";

import { t } from "@/admin/i18n";

export function buildPublicIdField(description?: { vi: string; en: string }): Field {
  return {
    name: "publicId",
    label: t("Mã công khai", "Public ID"),
    type: "text",
    unique: true,
    index: true,
    required: true,
    admin: {
      readOnly: true,
      description:
        description ??
        t(
          "Định danh ổn định cho API công khai, audit, report và đồng bộ dữ liệu.",
          "Stable identifier for public APIs, audit, reports, and data synchronization.",
        ),
    },
  };
}
