import type { Field } from "payload";

import { t } from "@/admin/i18n";

export function buildSlugField(): Field {
  return {
    name: "slug",
    label: t("Đường dẫn", "Slug"),
    type: "text",
    index: true,
    unique: true,
    required: true,
    admin: {
      description: t("Đường dẫn thân thiện cho URL, sẽ tự sinh nếu để trống.", "URL-friendly slug, auto-generated when empty."),
      placeholder: "pham-am-tinh-do",
    },
  };
}

