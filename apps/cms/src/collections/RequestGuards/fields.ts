import type { Field } from "payload";

import { t } from "@/admin/i18n";

export const requestGuardFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Khóa guard", "Guard keys"),
        fields: [
          {
            name: "guardKey",
            label: t("Guard key", "Guard key"),
            type: "text",
            required: true,
            unique: true,
            index: true,
          },
          {
            name: "scope",
            label: t("Scope", "Scope"),
            type: "text",
            required: true,
          },
          {
            name: "notes",
            label: t("Ghi chú", "Notes"),
            type: "textarea",
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
                name: "expiresAt",
                label: t("Hết hạn lúc", "Expires at"),
                type: "date",
                required: true,
              },
              {
                name: "lastSeenAt",
                label: t("Ghi nhận gần nhất", "Last seen at"),
                type: "date",
              },
            ],
          },
          {
            name: "hits",
            label: t("Số hit", "Hits"),
            type: "number",
            defaultValue: 0,
            min: 0,
          },
        ],
      },
    ],
  },
];
