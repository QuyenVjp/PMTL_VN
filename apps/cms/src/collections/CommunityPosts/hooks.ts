import { revalidateContent } from "@/hooks/revalidate-content";
import { submitCommunityPost } from "@/services/community.service";

type CommunityPostHookArgs = {
  data?: Record<string, unknown>;
  doc?: Record<string, unknown>;
  collection?: {
    slug?: string;
  };
};

export const communityPostHooks = {
  beforeChange: [
    ({ data }: CommunityPostHookArgs) => {
      return data ? submitCommunityPost(data) : data;
    },
  ],
  afterChange: [
    async ({ doc, collection }: CommunityPostHookArgs) => {
      if (!doc) {
        return;
      }

      await revalidateContent({
        doc,
        ...(collection ? { collection } : {}),
      });
    },
  ],
};
