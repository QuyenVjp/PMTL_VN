import { getLogger } from "@/services/logger.service";
import { publishWebhookEvent } from "@/integrations/webhooks/publish-event";

type RevalidateArgs = {
  doc?: {
    id?: string | number | null;
    publicId?: string | null;
    slug?: string | null;
  };
  collection?: {
    slug?: string;
  };
  operation?: "create" | "update" | "delete";
};

const logger = getLogger("hooks:revalidate-content");

export async function revalidateContent({ collection, doc, operation = "update" }: RevalidateArgs): Promise<void> {
  if (!collection?.slug) {
    logger.warn({ operation, slug: doc?.slug }, "Skipping content revalidation because collection slug is missing");
    return;
  }

  logger.info(
    {
      collection: collection.slug,
      slug: doc?.slug,
      operation,
    },
    "Content revalidation requested",
  );

  await publishWebhookEvent({
    source: "payload",
    entityType: "collection",
    slug: collection.slug,
    operation,
    document: {
      ...(doc?.id != null ? { id: doc.id } : {}),
      ...(doc?.publicId !== undefined ? { publicId: doc.publicId } : {}),
      ...(doc?.slug !== undefined ? { slug: doc.slug } : {}),
    },
  });
}
