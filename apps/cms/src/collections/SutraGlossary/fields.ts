import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const sutraGlossaryFields: Field[] = [
  buildPublicIdField(),
  {
    type: "row",
    fields: [
      {
        name: "sutra",
        label: t("Kinh", "Sutra"),
        type: "relationship",
        relationTo: "sutras",
        required: true,
      },
      {
        name: "term",
        label: t("Thuật ngữ", "Term"),
        type: "text",
        required: true,
      },
    ],
  },
  {
    name: "meaning",
    label: t("Giải nghĩa", "Meaning"),
    type: "textarea",
    required: true,
  },
  {
    type: "row",
    fields: [
      {
        name: "volume",
        label: t("Quyển", "Volume"),
        type: "relationship",
        relationTo: "sutraVolumes",
      },
      {
        name: "chapter",
        label: t("Chương", "Chapter"),
        type: "relationship",
        relationTo: "sutraChapters",
      },
      {
        name: "sortOrder",
        label: t("Thứ tự", "Sort order"),
        type: "number",
        defaultValue: 0,
      },
    ],
  },
  {
    name: "markerKey",
    label: t("Marker key", "Marker key"),
    type: "text",
  },
];
