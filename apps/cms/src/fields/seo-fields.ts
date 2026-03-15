import type { Field } from "payload";

import { t } from "@/admin/i18n";

export function buildSeoGroupField(): Field {
  return {
    name: "seo",
    label: t("SEO", "SEO"),
    type: "group",
    fields: [
      {
        name: "metaTitle",
        label: t("Meta title", "Meta title"),
        type: "text",
      },
      {
        name: "metaDescription",
        label: t("Meta description", "Meta description"),
        type: "textarea",
      },
      {
        name: "ogImage",
        label: t("Ảnh chia sẻ", "OG image"),
        type: "relationship",
        relationTo: "media",
      },
      {
        name: "canonicalUrl",
        label: t("Canonical URL", "Canonical URL"),
        type: "text",
      },
    ],
  };
}
