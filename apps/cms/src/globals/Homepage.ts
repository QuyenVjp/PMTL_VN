import type { GlobalConfig } from "payload";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  fields: [
    {
      name: "heroTitle",
      type: "text",
      required: true,
    },
    {
      name: "heroDescription",
      type: "textarea",
      required: true,
    },
  ],
};

