import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildSlugField } from "@/fields/slug-field";
import { buildPublicIdField } from "@/fields/public-id-field";

export const categoryFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Cơ bản", "Basics"),
        fields: [
          buildPublicIdField(),
          {
            name: "name",
            label: t("Tên chủ đề", "Name"),
            type: "text",
            required: true,
            admin: {
              placeholder: t("Tịnh độ, Niệm Phật, Kinh sách...", "Pure Land, Buddha Recitation, Scriptures..."),
            },
          },
          buildSlugField(),
          {
            name: "description",
            label: t("Mô tả ngắn", "Description"),
            type: "textarea",
            admin: {
              placeholder: t("Mô tả ngắn để editor biết khi nào nên dùng chủ đề này", "Short description for editors to know when to use this category"),
            },
          },
        ],
      },
      {
        label: t("Cấu trúc", "Structure"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "parent",
                label: t("Chủ đề cha", "Parent category"),
                type: "relationship",
                relationTo: "categories",
              },
              {
                name: "color",
                label: t("Màu gợi ý", "Color"),
                type: "text",
              },
            ],
          },
        ],
      },
      {
        label: t("Hệ thống", "System"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "order",
                label: t("Thứ tự", "Order"),
                type: "number",
                defaultValue: 0,
              },
              {
                name: "isActive",
                label: t("Đang dùng", "Active"),
                type: "checkbox",
                defaultValue: true,
              },
            ],
          },
        ],
      },
    ],
  },
];
