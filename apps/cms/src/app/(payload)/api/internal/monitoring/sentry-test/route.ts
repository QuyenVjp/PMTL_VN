import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { getLogger } from "@/services/logger.service";

const logger = getLogger("monitoring:test");

const requestSchema = z.object({
  secret: z.string().min(1),
  message: z.string().trim().min(1).max(200).default("PMTL cms monitoring test error"),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse({
    secret: request.headers.get("x-monitoring-test-secret") ?? "",
    message: (json as { message?: unknown }).message,
  });

  if (!parsed.success || parsed.data.secret !== process.env.MONITORING_TEST_SECRET) {
    return Response.json(
      {
        error: "Unauthorized monitoring test request.",
      },
      { status: 401 },
    );
  }

  try {
    throw new Error(parsed.data.message);
  } catch (error) {
    const eventId = Sentry.captureException(error, {
      tags: {
        app: "cms",
        monitoring_test: "true",
      },
    });

    logger.error({ error, eventId }, "CMS monitoring test triggered");

    await Sentry.flush(2000);

    return Response.json(
      {
        ok: false,
        eventId,
        message: parsed.data.message,
      },
      { status: 500 },
    );
  }
}
