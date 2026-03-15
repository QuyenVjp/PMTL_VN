import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const lunarEventOverrideFields: Field[] = [
  buildPublicIdField(),
  {
    type: "row",
    fields: [
      {
        name: "lunarEvent",
        label: t("Sự kiện âm lịch", "Lunar event"),
        type: "relationship",
        relationTo: "lunarEvents",
        required: true,
      },
      {
        name: "chantItem",
        label: t("Bài niệm", "Chant item"),
        type: "relationship",
        relationTo: "chantItems",
        required: true,
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "mode",
        label: t("Chế độ", "Mode"),
        type: "text",
      },
      {
        name: "target",
        label: t("Mục tiêu", "Target"),
        type: "number",
      },
      {
        name: "max",
        label: t("Tối đa", "Max"),
        type: "number",
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
    name: "note",
    label: t("Ghi chú", "Note"),
    type: "textarea",
  },
];
