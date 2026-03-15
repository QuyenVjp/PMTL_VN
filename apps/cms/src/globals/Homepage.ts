import type { GlobalConfig } from "payload";

import { t } from "@/admin/i18n";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: t("Trang chủ", "Homepage"),
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: t("Hero", "Hero"),
          fields: [
            {
              type: "group",
              label: t("Nội dung hero", "Hero content"),
              fields: [
                {
                  name: "heroTitle",
                  label: t("Tiêu đề chính", "Main title"),
                  type: "text",
                  required: true,
                  admin: {
                    placeholder: t("Tịnh độ thánh cảnh và hướng tu học", "Pure Land sacred scenery and study direction"),
                  },
                },
                {
                  name: "heroDescription",
                  label: t("Mô tả ngắn", "Short description"),
                  type: "textarea",
                  required: true,
                },
              ],
            },
            {
              type: "group",
              label: t("Nút hành động", "Action buttons"),
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "heroPrimaryLabel",
                      label: t("Tên nút chính", "Primary button label"),
                      type: "text",
                    },
                    {
                      name: "heroPrimaryHref",
                      label: t("Link nút chính", "Primary button URL"),
                      type: "text",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: t("Nổi bật", "Featured"),
          fields: [
            {
              name: "featuredSectionTitle",
              label: t("Tiêu đề section nổi bật", "Featured section title"),
              type: "text",
              required: true,
            },
            {
              name: "featuredSectionDescription",
              label: t("Mô tả section nổi bật", "Featured section description"),
              type: "textarea",
            },
          ],
        },
        {
          label: t("Nội dung mới", "Latest content"),
          fields: [
            {
              name: "latestSectionTitle",
              label: t("Tiêu đề section nội dung mới", "Latest section title"),
              type: "text",
              required: true,
            },
            {
              name: "latestSectionDescription",
              label: t("Mô tả section nội dung mới", "Latest section description"),
              type: "textarea",
            },
          ],
        },
        {
          label: t("Tu học", "Self-study"),
          fields: [
            {
              name: "studySectionTitle",
              label: t("Tiêu đề section tu học", "Study section title"),
              type: "text",
              required: true,
            },
            {
              name: "studySectionDescription",
              label: t("Mô tả section tu học", "Study section description"),
              type: "textarea",
            },
          ],
        },
        {
          label: t("Hệ thống và SEO", "System and SEO"),
          fields: [
            {
              type: "collapsible",
              label: t("Cấu hình SEO nâng cao", "Advanced SEO settings"),
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "metaTitle",
                  label: t("Meta title nếu cần", "Meta title override"),
                  type: "text",
                },
                {
                  name: "metaDescription",
                  label: t("Meta description nếu cần", "Meta description override"),
                  type: "textarea",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

