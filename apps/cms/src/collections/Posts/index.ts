import type { CollectionConfig } from "payload";

import { postAccess } from "./access";
import { postFields } from "./fields";
import { postHooks } from "./hooks";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: {
    singular: "Post",
    plural: "Posts",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "publishedAt"],
    listSearchableFields: ["title", "slug", "excerpt"],
    enableListViewSelectAPI: true,
  },
  access: postAccess,
  hooks: postHooks,
  versions: {
    drafts: true,
  },
  fields: postFields,
};
