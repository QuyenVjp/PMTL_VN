import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  fields: [
    {
      name: "siteName",
      type: "text",
      required: true,
    },
    {
      name: "siteDescription",
      type: "textarea",
      required: true,
    },
  ],
};

