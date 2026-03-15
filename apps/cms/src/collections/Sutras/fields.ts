import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSeoGroupField } from "@/fields/seo-fields";
import { buildSlugField } from "@/fields/slug-field";

export const sutraFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Cơ bản", "Basics"),
        fields: [
          buildPublicIdField(),
          {
            name: "title",
            label: t("Tiêu đề", "Title"),
            type: "text",
            required: true,
          },
          buildSlugField(),
          {
            name: "description",
            label: t("Mô tả", "Description"),
            type: "textarea",
          },
          {
            name: "shortExcerpt",
            label: t("Trích đoạn ngắn", "Short excerpt"),
            type: "textarea",
          },
        ],
      },
      {
        label: t("Media", "Media"),
        fields: [
          {
            name: "coverImage",
            label: t("Ảnh bìa", "Cover image"),
            type: "relationship",
            relationTo: "media",
          },
        ],
      },
      {
        label: t("Phân loại", "Classification"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "translator",
                label: t("Dịch giả", "Translator"),
                type: "text",
              },
              {
                name: "reviewer",
                label: t("Hiệu đính", "Reviewer"),
                type: "text",
              },
            ],
          },
          {
            name: "tags",
            label: t("Tags", "Tags"),
            type: "relationship",
            relationTo: "tags",
            hasMany: true,
          },
        ],
      },
      {
        label: t("SEO", "SEO"),
        fields: [buildSeoGroupField()],
      },
      {
        label: t("Hệ thống", "System"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "isFeatured",
                label: t("Nổi bật", "Featured"),
                type: "checkbox",
                defaultValue: false,
              },
              {
                name: "sortOrder",
                label: t("Thứ tự", "Sort order"),
                type: "number",
                defaultValue: 0,
              },
            ],
          },
        ],
      },
    ],
  },
];
