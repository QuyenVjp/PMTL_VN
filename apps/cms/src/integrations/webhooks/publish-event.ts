import type { RevalidationWebhookPayload } from "@pmtl/shared";
import { revalidationWebhookSchema } from "@pmtl/shared";

import { getLogger, withError } from "@/services/logger.service";

const logger = getLogger("integrations:webhooks:publish-event");

export async function publishWebhookEvent(payload: RevalidationWebhookPayload): Promise<void> {
  const targetUrl = process.env.INTERNAL_WEBHOOK_URL?.trim();
  const secret = process.env.REVALIDATE_SECRET?.trim();

  if (!targetUrl) {
    logger.debug({ slug: payload.slug }, "Skipping revalidation webhook because INTERNAL_WEBHOOK_URL is not configured");
    return;
  }

  if (!secret) {
    logger.warn({ slug: payload.slug }, "Skipping revalidation webhook because REVALIDATE_SECRET is not configured");
    return;
  }

  const validatedPayload = revalidationWebhookSchema.parse(payload);

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedPayload),
      cache: "no-store",
    });

    if (!response.ok) {
      const responseBody = await response.text().catch(() => "");
      logger.error(
        {
          slug: validatedPayload.slug,
          entityType: validatedPayload.entityType,
          operation: validatedPayload.operation,
          status: response.status,
          responseBody,
        },
        "Revalidation webhook failed",
      );
    }
  } catch (error) {
    logger.error(withError({ slug: validatedPayload.slug, entityType: validatedPayload.entityType }, error), "Revalidation webhook crashed");
  }
}

