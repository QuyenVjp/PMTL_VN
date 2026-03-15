import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { communityPostAccess } from "./access";
import { communityPostFields } from "./fields";
import { communityPostHooks } from "./hooks";

export const CommunityPosts: CollectionConfig = {
  slug: "communityPosts",
  labels: {
    singular: t("Bài cộng đồng", "Community post"),
    plural: t("Bài cộng đồng", "Community posts"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "moderationStatus", "reportCount", "updatedAt"],
  },
  access: communityPostAccess,
  hooks: communityPostHooks,
  versions: {
    drafts: true,
  },
  fields: communityPostFields,
};
