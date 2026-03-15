import type { GlobalConfig } from "payload";

import { t } from "@/admin/i18n";
import { revalidateGlobal } from "@/hooks/revalidate-global";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: t("Điều hướng", "Navigation"),
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      async ({ doc, global }) => {
        await revalidateGlobal({ doc, global });
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: t("Menu chính", "Main navigation"),
          fields: [
            {
              name: "items",
              label: t("Danh sách menu", "Navigation items"),
              type: "array",
              admin: {
                description: t(
                  "Mỗi dòng là một mục menu ở đầu trang. Ưu tiên tên ngắn gọn, dễ đọc.",
                  "Each row becomes one top navigation item.",
                ),
              },
              fields: [
                {
                  name: "label",
                  label: t("Tên mục", "Label"),
                  type: "text",
                  required: true,
                },
                {
                  name: "href",
                  label: t("Đường dẫn", "URL"),
                  type: "text",
                  required: true,
                },
                {
                  name: "openInNewTab",
                  label: t("Mở tab mới", "Open in new tab"),
                  type: "checkbox",
                  defaultValue: false,
                },
              ],
            },
          ],
        },
        {
          label: t("Nút nổi bật", "Highlight CTA"),
          fields: [
            {
              type: "group",
              label: t("Nút CTA", "CTA"),
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "ctaLabel",
                      label: t("Tên nút", "Button label"),
                      type: "text",
                    },
                    {
                      name: "ctaHref",
                      label: t("Link nút", "Button URL"),
                      type: "text",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

