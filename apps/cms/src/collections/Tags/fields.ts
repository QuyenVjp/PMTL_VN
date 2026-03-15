import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSlugField } from "@/fields/slug-field";

export const tagFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Cơ bản", "Basics"),
        fields: [
          buildPublicIdField(),
          {
            name: "name",
            label: t("Tên nhãn", "Tag name"),
            type: "text",
            required: true,
          },
          buildSlugField(),
          {
            name: "description",
            label: t("Mô tả", "Description"),
            type: "textarea",
          },
        ],
      },
      {
        label: t("Hệ thống", "System"),
        fields: [
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
];
