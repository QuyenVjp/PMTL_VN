import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { communityCommentAccess } from "./access";
import { communityCommentFields } from "./fields";
import { communityCommentHooks } from "./hooks";

export const CommunityComments: CollectionConfig = {
  slug: "communityComments",
  labels: {
    singular: t("Bình luận cộng đồng", "Community comment"),
    plural: t("Bình luận cộng đồng", "Community comments"),
  },
  admin: {
    useAsTitle: "authorNameSnapshot",
    defaultColumns: ["authorNameSnapshot", "post", "moderationStatus", "reportCount", "updatedAt"],
  },
  access: communityCommentAccess,
  hooks: communityCommentHooks,
  fields: communityCommentFields,
};
