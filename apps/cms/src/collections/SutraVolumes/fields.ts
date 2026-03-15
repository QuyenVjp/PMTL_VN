import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const sutraVolumeFields: Field[] = [
  buildPublicIdField(),
  {
    name: "sutra",
    label: t("Kinh", "Sutra"),
    type: "relationship",
    relationTo: "sutras",
    required: true,
  },
  {
    type: "row",
    fields: [
      {
        name: "title",
        label: t("Tiêu đề", "Title"),
        type: "text",
        required: true,
      },
      {
        name: "volumeNumber",
        label: t("Số quyển", "Volume number"),
        type: "number",
        required: true,
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
    name: "description",
    label: t("Mô tả", "Description"),
    type: "textarea",
  },
  {
    type: "row",
    fields: [
      {
        name: "bookStart",
        label: t("Bắt đầu sách", "Book start"),
        type: "text",
      },
      {
        name: "bookEnd",
        label: t("Kết thúc sách", "Book end"),
        type: "text",
      },
    ],
  },
];
