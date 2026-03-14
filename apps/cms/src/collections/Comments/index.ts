import type { CollectionConfig } from "payload";

import { commentAccess } from "./access";
import { commentFields } from "./fields";
import { commentHooks } from "./hooks";

export const Comments: CollectionConfig = {
  slug: "comments",
  labels: {
    singular: "Comment",
    plural: "Comments",
  },
  admin: {
    useAsTitle: "authorName",
    defaultColumns: ["authorName", "status", "updatedAt"],
  },
  access: commentAccess,
  hooks: commentHooks,
  fields: commentFields,
};

