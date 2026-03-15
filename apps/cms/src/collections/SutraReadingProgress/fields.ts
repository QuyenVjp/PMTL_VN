import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const sutraReadingProgressFields: Field[] = [
  buildPublicIdField(),
  {
    type: "row",
    fields: [
      {
        name: "user",
        label: t("Người dùng", "User"),
        type: "relationship",
        relationTo: "users",
        required: true,
      },
      {
        name: "sutra",
        label: t("Kinh", "Sutra"),
        type: "relationship",
        relationTo: "sutras",
        required: true,
      },
    ],
  },
  {
    name: "location",
    label: t("Vị trí", "Location"),
    type: "group",
    fields: [
      {
        name: "chapter",
        label: t("Chương", "Chapter"),
        type: "relationship",
        relationTo: "sutraChapters",
      },
      {
        name: "paragraph",
        label: t("Đoạn", "Paragraph"),
        type: "text",
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "scrollPercent",
        label: t("Phần trăm đọc", "Scroll percent"),
        type: "number",
        defaultValue: 0,
      },
      {
        name: "lastReadAt",
        label: t("Đọc gần nhất", "Last read at"),
        type: "date",
      },
    ],
  },
];
