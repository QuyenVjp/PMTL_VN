import type { GlobalConfig } from "payload";

import { t } from "@/admin/i18n";

export const SidebarConfig: GlobalConfig = {
  slug: "sidebar-config",
  label: t("Cấu hình sidebar", "Sidebar config"),
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: t("Hiển thị", "Visibility"),
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "showSearch",
                  label: t("Hiện ô tìm kiếm", "Show search"),
                  type: "checkbox",
                  defaultValue: true,
                },
                {
                  name: "showCategoryTree",
                  label: t("Hiện danh mục", "Show category tree"),
                  type: "checkbox",
                  defaultValue: true,
                },
                {
                  name: "showArchive",
                  label: t("Hiện lưu trữ", "Show archive"),
                  type: "checkbox",
                  defaultValue: true,
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "showLatestComments",
                  label: t("Hiện bình luận mới", "Show latest comments"),
                  type: "checkbox",
                  defaultValue: true,
                },
                {
                  name: "showDownloadLinks",
                  label: t("Hiện tải về", "Show download links"),
                  type: "checkbox",
                  defaultValue: true,
                },
              ],
            },
          ],
        },
        {
          label: t("Liên kết tải về", "Download links"),
          fields: [
            {
              name: "downloadLinks",
              label: t("Danh sách link", "Links"),
              type: "array",
              fields: [
                {
                  name: "label",
                  label: t("Tên hiển thị", "Label"),
                  type: "text",
                  required: true,
                },
                {
                  name: "href",
                  label: t("Đường dẫn", "URL"),
                  type: "text",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: t("Mạng xã hội", "Social"),
          fields: [
            {
              name: "socialLinks",
              label: t("Liên kết mạng xã hội", "Social links"),
              type: "array",
              fields: [
                {
                  name: "label",
                  label: t("Tên", "Label"),
                  type: "text",
                  required: true,
                },
                {
                  name: "href",
                  label: t("Liên kết", "URL"),
                  type: "text",
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
