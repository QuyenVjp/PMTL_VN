import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSeoGroupField } from "@/fields/seo-fields";

const guideTypeOptions = [
  { label: t("Nhập môn", "Starter"), value: "starter" },
  { label: t("Thực hành", "Practice"), value: "practice" },
  { label: t("FAQ", "FAQ"), value: "faq" },
];

export const beginnerGuideFields: Field[] = [
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
          {
            name: "description",
            label: t("Mô tả", "Description"),
            type: "textarea",
          },
          {
            name: "content",
            label: t("Nội dung", "Content"),
            type: "richText",
          },
          {
            type: "row",
            fields: [
              {
                name: "guideType",
                label: t("Loại", "Guide type"),
                type: "select",
                options: guideTypeOptions,
                defaultValue: "starter",
                required: true,
              },
              {
                name: "duration",
                label: t("Thời lượng", "Duration"),
                type: "text",
              },
              {
                name: "stepNumber",
                label: t("Bước", "Step number"),
                type: "number",
              },
            ],
          },
          {
            name: "details",
            label: t("Các ý chính", "Details"),
            type: "array",
            fields: [
              {
                name: "title",
                label: t("Tiêu đề", "Title"),
                type: "text",
              },
              {
                name: "content",
                label: t("Nội dung", "Content"),
                type: "textarea",
              },
            ],
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
                name: "iconName",
                label: t("Tên icon", "Icon name"),
                type: "text",
              },
              {
                name: "pdfURL",
                label: t("PDF URL", "PDF URL"),
                type: "text",
              },
              {
                name: "videoURL",
                label: t("Video URL", "Video URL"),
                type: "text",
              },
            ],
          },
          {
            name: "images",
            label: t("Hình ảnh", "Images"),
            type: "relationship",
            relationTo: "media",
            hasMany: true,
          },
          {
            name: "attachedFiles",
            label: t("Tệp đính kèm", "Attached files"),
            type: "relationship",
            relationTo: "media",
            hasMany: true,
          },
        ],
      },
      {
        label: t("SEO", "SEO"),
        fields: [buildSeoGroupField()],
      },
      {
        label: t("Hệ thống", "System"),
        fields: [
          {
            name: "order",
            label: t("Thứ tự", "Order"),
            type: "number",
            defaultValue: 0,
          },
        ],
      },
    ],
  },
];
