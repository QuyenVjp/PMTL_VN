import { publishWebhookEvent } from "@/integrations/webhooks/publish-event";
import { getLogger } from "@/services/logger.service";

type RevalidateGlobalArgs = {
  global?: {
    slug?: string;
  };
  doc?: {
    id?: string | number | null;
    slug?: string | null;
  };
  operation?: "create" | "update" | "delete";
};

const logger = getLogger("hooks:revalidate-global");

export async function revalidateGlobal({ global, doc, operation = "update" }: RevalidateGlobalArgs): Promise<void> {
  if (!global?.slug) {
    logger.warn({ operation }, "Skipping global revalidation because global slug is missing");
    return;
  }

  logger.info({ global: global.slug, operation }, "Global revalidation requested");

  await publishWebhookEvent({
    source: "payload",
    entityType: "global",
    slug: global.slug,
    operation,
    document: {
      ...(doc?.id != null ? { id: doc.id } : {}),
      ...(doc?.slug !== undefined ? { slug: doc.slug } : {}),
    },
  });
}
