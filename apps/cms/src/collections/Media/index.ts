import type { CollectionConfig } from "payload";

import { mediaAccess } from "./access";
import { mediaFields } from "./fields";
import { mediaHooks } from "./hooks";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Media",
    plural: "Media",
  },
  access: mediaAccess,
  hooks: mediaHooks,
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
  },
  fields: mediaFields,
};

