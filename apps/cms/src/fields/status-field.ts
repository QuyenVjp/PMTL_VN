import type { Field } from "payload";
import { contentStatusValues } from "@pmtl/shared";

import { t } from "@/admin/i18n";

export function buildContentStatusField(): Field {
  return {
    name: "status",
    label: t("Trạng thái hiển thị", "Content status"),
    type: "select",
    defaultValue: "draft",
    options: contentStatusValues.map((value) => ({
      label:
        value === "draft"
          ? t("Bản nháp", "Draft")
          : value === "published"
            ? t("Đã đăng", "Published")
            : value,
      value,
    })),
    required: true,
    admin: {
      description: t("Chọn trạng thái hiển thị của nội dung.", "Choose the document visibility status."),
    },
  };
}

