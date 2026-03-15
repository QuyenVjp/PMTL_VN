import type { GlobalConfig } from "payload";

import { t } from "@/admin/i18n";
import { buildSeoGroupField } from "@/fields/seo-fields";

export const ChantingSettings: GlobalConfig = {
  slug: "chanting-settings",
  label: t("Cài đặt niệm chú", "Chanting settings"),
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: t("Mở đầu trang", "Page intro"),
          fields: [
            {
              name: "pageTitle",
              label: t("Tiêu đề trang", "Page title"),
              type: "text",
              required: true,
            },
            {
              name: "pageDescription",
              label: t("Mô tả ngắn", "Page description"),
              type: "textarea",
            },
          ],
        },
        {
          label: t("Hướng dẫn", "Guidelines"),
          fields: [
            {
              name: "guidelineSections",
              label: t("Các mục hướng dẫn", "Guideline sections"),
              type: "array",
              fields: [
                {
                  name: "title",
                  label: t("Tiêu đề", "Title"),
                  type: "text",
                  required: true,
                },
                {
                  name: "content",
                  label: t("Nội dung", "Content"),
                  type: "textarea",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: t("SEO", "SEO"),
          fields: [buildSeoGroupField()],
        },
      ],
    },
  ],
};
