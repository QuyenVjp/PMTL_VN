import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";

const requestSchema = z.object({
  secret: z.string().min(1),
  message: z.string().trim().min(1).max(200).default("PMTL web monitoring test error"),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse({
    secret: request.headers.get("x-monitoring-test-secret") ?? "",
    message: (json as { message?: unknown }).message,
  });

  if (!parsed.success || parsed.data.secret !== process.env.MONITORING_TEST_SECRET) {
    return NextResponse.json(
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
        app: "web",
        monitoring_test: "true",
      },
    });

    logger.error("Web monitoring test triggered", {
      eventId,
      error,
    });

    await Sentry.flush(2000);

    return NextResponse.json(
      {
        ok: false,
        eventId,
        message: parsed.data.message,
      },
      { status: 500 },
    );
  }
}
