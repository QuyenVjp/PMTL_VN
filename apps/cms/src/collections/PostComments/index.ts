import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { postCommentAccess } from "./access";
import { postCommentFields } from "./fields";
import { postCommentHooks } from "./hooks";

export const PostComments: CollectionConfig = {
  slug: "postComments",
  labels: {
    singular: t("Bình luận bài viết", "Post comment"),
    plural: t("Bình luận bài viết", "Post comments"),
  },
  admin: {
    useAsTitle: "authorName",
    defaultColumns: ["authorName", "post", "moderationStatus", "reportCount", "updatedAt"],
  },
  access: postCommentAccess,
  hooks: postCommentHooks,
  fields: postCommentFields,
};
