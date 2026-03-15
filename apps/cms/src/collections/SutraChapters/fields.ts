import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSlugField } from "@/fields/slug-field";

export const sutraChapterFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Cơ bản", "Basics"),
        fields: [
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
                index: true,
              },
              {
                name: "volume",
                label: t("Quyển", "Volume"),
                type: "relationship",
                relationTo: "sutraVolumes",
                index: true,
              },
            ],
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
              buildSlugField(),
              {
                name: "chapterNumber",
                label: t("Số chương", "Chapter number"),
                type: "number",
                required: true,
                index: true,
              },
            ],
          },
          {
            name: "openingText",
            label: t("Mở đầu", "Opening text"),
            type: "textarea",
          },
          {
            name: "endingText",
            label: t("Kết thúc", "Ending text"),
            type: "textarea",
          },
        ],
      },
      {
        label: t("Nội dung", "Content"),
        fields: [
          {
            name: "content",
            label: t("Nội dung", "Content"),
            type: "richText",
            required: true,
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
                name: "estimatedReadMinutes",
                label: t("Ước tính phút đọc", "Estimated read minutes"),
                type: "number",
                admin: { readOnly: true },
              },
              {
                name: "sortOrder",
                label: t("Thứ tự", "Sort order"),
                type: "number",
                defaultValue: 0,
                index: true,
              },
            ],
          },
        ],
      },
    ],
  },
];
