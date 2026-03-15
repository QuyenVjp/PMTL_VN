import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { postAccess } from "./access";
import { postFields } from "./fields";
import { postHooks } from "./hooks";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: {
    singular: t("Bài viết", "Post"),
    plural: t("Bài viết", "Posts"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "postType", "primaryCategory", "_status", "updatedAt", "publishedAt"],
    listSearchableFields: ["sourceRef", "title", "slug", "excerptComputed"],
    enableListViewSelectAPI: true,
  },
  access: postAccess,
  hooks: postHooks,
  versions: {
    drafts: true,
  },
  fields: postFields,
};
