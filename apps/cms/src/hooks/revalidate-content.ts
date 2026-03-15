type RevalidateArgs = {
  doc?: {
    slug?: string;
  };
  collection?: {
    slug?: string;
  };
};

import { getLogger } from "@/services/logger.service";

const logger = getLogger("hooks:revalidate-content");

export function revalidateContent({ collection, doc }: RevalidateArgs): Promise<void> {
  logger.info({
    collection: collection?.slug,
    slug: doc?.slug,
  }, "Content revalidation requested");

  return Promise.resolve();
}
