import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSlugField } from "@/fields/slug-field";

export const chantPlanFields: Field[] = [
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
            name: "planType",
            label: t("Loại kế hoạch", "Plan type"),
            type: "text",
            required: true,
          },
        ],
      },
      {
        label: t("Kế hoạch", "Plan"),
        fields: [
          {
            name: "planItems",
            label: t("Danh sách bài niệm", "Plan items"),
            type: "array",
            fields: [
              {
                name: "chantItem",
                label: t("Bài niệm", "Chant item"),
                type: "relationship",
                relationTo: "chantItems",
                required: true,
              },
              {
                name: "target",
                label: t("Số lượng", "Target"),
                type: "number",
              },
              {
                name: "isOptional",
                label: t("Tùy chọn", "Optional"),
                type: "checkbox",
                defaultValue: false,
              },
            ],
          },
        ],
      },
    ],
  },
];
