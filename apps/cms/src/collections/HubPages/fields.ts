import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSeoGroupField } from "@/fields/seo-fields";
import { buildSlugField } from "@/fields/slug-field";

export const hubPageFields: Field[] = [
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
            type: "row",
            fields: [
              {
                name: "coverImage",
                label: t("Ảnh bìa", "Cover image"),
                type: "relationship",
                relationTo: "media",
              },
              {
                name: "visualTheme",
                label: t("Theme hiển thị", "Visual theme"),
                type: "text",
              },
            ],
          },
        ],
      },
      {
        label: t("Blocks", "Blocks"),
        fields: [
          {
            name: "blocks",
            label: t("Khối nội dung", "Blocks"),
            type: "array",
            fields: [
              {
                name: "type",
                label: t("Loại block", "Block type"),
                type: "text",
                required: true,
              },
              {
                name: "title",
                label: t("Tiêu đề", "Title"),
                type: "text",
              },
              {
                name: "content",
                label: t("Nội dung", "Content"),
                type: "textarea",
              },
            ],
          },
        ],
      },
      {
        label: t("Liên kết", "Connections"),
        fields: [
          {
            name: "curatedPosts",
            label: t("Bài viết chọn lọc", "Curated posts"),
            type: "relationship",
            relationTo: "posts",
            hasMany: true,
          },
          {
            name: "downloads",
            label: t("Tệp tải về", "Downloads"),
            type: "relationship",
            relationTo: "downloads",
            hasMany: true,
          },
        ],
      },
      {
        label: t("Menu", "Menu"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "menuLabel",
                label: t("Tên menu", "Menu label"),
                type: "text",
              },
              {
                name: "menuIconName",
                label: t("Icon menu", "Menu icon"),
                type: "text",
              },
            ],
          },
          {
            type: "row",
            fields: [
              {
                name: "showInMenu",
                label: t("Hiện trong menu", "Show in menu"),
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
      {
        label: t("SEO", "SEO"),
        fields: [buildSeoGroupField()],
      },
    ],
  },
];
