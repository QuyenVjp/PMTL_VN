import type { GlobalConfig } from "payload";

import { t } from "@/admin/i18n";
import { revalidateGlobal } from "@/hooks/revalidate-global";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: t("Cài đặt website", "Site settings"),
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
          label: t("Thông tin chung", "General information"),
          fields: [
            {
              name: "siteName",
              label: t("Tên website", "Site name"),
              type: "text",
              required: true,
            },
            {
              name: "siteDescription",
              label: t("Mô tả ngắn", "Short description"),
              type: "textarea",
              required: true,
            },
          ],
        },
        {
          label: t("Liên hệ", "Contact"),
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "supportEmail",
                  label: t("Email liên hệ", "Support email"),
                  type: "email",
                },
                {
                  name: "supportPhone",
                  label: t("Số điện thoại liên hệ", "Support phone"),
                  type: "text",
                },
              ],
            },
          ],
        },
        {
          label: t("SEO mặc định", "Default SEO"),
          fields: [
            {
              type: "collapsible",
              label: t("Tùy chọn SEO", "SEO options"),
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "defaultMetaTitle",
                  label: t("Meta title mặc định", "Default meta title"),
                  type: "text",
                },
                {
                  name: "defaultMetaDescription",
                  label: t("Meta description mặc định", "Default meta description"),
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
