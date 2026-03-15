import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSlugField } from "@/fields/slug-field";

export const chantItemFields: Field[] = [
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
            name: "kind",
            label: t("Loại bài niệm", "Kind"),
            type: "text",
            required: true,
          },
          {
            name: "openingPrayer",
            label: t("Lời nguyện mở đầu", "Opening prayer"),
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
        label: t("Media", "Media"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "audio",
                label: t("Audio", "Audio"),
                type: "relationship",
                relationTo: "media",
              },
              {
                name: "scriptFile",
                label: t("Script file", "Script file"),
                type: "relationship",
                relationTo: "media",
              },
            ],
          },
          {
            name: "scriptPreviewImages",
            label: t("Ảnh preview", "Preview images"),
            type: "relationship",
            relationTo: "media",
            hasMany: true,
          },
        ],
      },
      {
        label: t("Quy tắc", "Rules"),
        fields: [
          {
            name: "recommendedPresets",
            label: t("Preset gợi ý", "Recommended presets"),
            type: "array",
            fields: [
              {
                name: "label",
                label: t("Tên preset", "Preset label"),
                type: "text",
              },
              {
                name: "target",
                label: t("Số lượng", "Target"),
                type: "number",
              },
            ],
          },
          {
            name: "timeRules",
            label: t("Quy tắc thời gian", "Time rules"),
            type: "array",
            fields: [
              {
                type: "row",
                fields: [
                  {
                    name: "dateFrom",
                    label: t("Từ ngày", "Date from"),
                    type: "date",
                  },
                  {
                    name: "dateTo",
                    label: t("Đến ngày", "Date to"),
                    type: "date",
                  },
                  {
                    name: "lunarDay",
                    label: t("Ngày âm", "Lunar day"),
                    type: "number",
                  },
                ],
              },
              {
                name: "notes",
                label: t("Ghi chú", "Notes"),
                type: "text",
              },
            ],
          },
        ],
      },
    ],
  },
];
