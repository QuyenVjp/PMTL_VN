import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const lunarEventFields: Field[] = [
  buildPublicIdField(),
  {
    name: "title",
    label: t("Tiêu đề", "Title"),
    type: "text",
    required: true,
  },
  {
    name: "recurrenceData",
    label: t("Dữ liệu lặp", "Recurrence data"),
    type: "group",
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "lunarMonth",
            label: t("Tháng âm", "Lunar month"),
            type: "number",
          },
          {
            name: "lunarDay",
            label: t("Ngày âm", "Lunar day"),
            type: "number",
          },
          {
            name: "isLeapMonth",
            label: t("Tháng nhuận", "Leap month"),
            type: "checkbox",
            defaultValue: false,
          },
        ],
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "eventType",
        label: t("Loại sự kiện", "Event type"),
        type: "text",
      },
      {
        name: "priority",
        label: t("Ưu tiên", "Priority"),
        type: "number",
        defaultValue: 0,
      },
    ],
  },
  {
    name: "relatedPosts",
    label: t("Bài liên quan", "Related posts"),
    type: "relationship",
    relationTo: "posts",
    hasMany: true,
  },
];
