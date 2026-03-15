import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const mediaFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Thông tin ảnh", "Asset details"),
        fields: [
          buildPublicIdField(),
          {
            type: "row",
            fields: [
              {
                name: "alt",
                label: t("Mô tả alt", "Alt text"),
                type: "text",
                required: true,
                admin: {
                  description: t("Mô tả ngắn để hỗ trợ truy cập và SEO hình ảnh.", "Short accessible description for the image."),
                  placeholder: t("Ảnh minh họa bài giảng...", "Illustration for tutorial..."),
                },
              },
              {
                name: "caption",
                label: t("Chú thích", "Caption"),
                type: "textarea",
                admin: {
                  placeholder: t("Chú thích ngắn nếu cần hiển thị cùng hình ảnh", "Short caption to display with the image"),
                },
              },
            ],
          },
        ],
      },
      {
        label: t("Hệ thống", "System"),
        fields: [
          {
            name: "tags",
            label: t("Nhãn media", "Media tags"),
            type: "relationship",
            relationTo: "tags",
            hasMany: true,
            admin: {
              description: t("Tùy chọn. Dùng khi cần nhóm media theo chiến dịch hoặc chủ đề.", "Optional grouping for campaigns or topics."),
            },
          },
        ],
      },
    ],
  },
];

