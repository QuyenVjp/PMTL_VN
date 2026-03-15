import { revalidationWebhookSchema } from "@pmtl/shared";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { getRevalidationTarget } from "@/lib/revalidate";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    logger.error("Revalidation secret is missing", { requestId });
    return NextResponse.json({ revalidated: false, message: "Server misconfiguration: missing secret" }, { status: 500 });
  }

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (token !== secret) {
    logger.warn("Rejected revalidation request with invalid secret", { requestId });
    return NextResponse.json({ revalidated: false, message: "Unauthorized" }, { status: 401 });
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const parsedPayload = revalidationWebhookSchema.safeParse(rawBody);

  if (!parsedPayload.success) {
    logger.warn("Rejected revalidation request with invalid payload", {
      requestId,
      issues: parsedPayload.error.flatten(),
    });
    return NextResponse.json({ revalidated: false, message: "Invalid revalidation payload" }, { status: 400 });
  }

  const payload = parsedPayload.data;
  const { tags, paths } = getRevalidationTarget(payload);

  if (tags.length === 0 && paths.length === 0) {
    logger.warn("Revalidation payload did not match any cache targets", {
      requestId,
      slug: payload.slug,
      entityType: payload.entityType,
      operation: payload.operation,
    });
    return NextResponse.json({
      revalidated: false,
      message: `No cache targets registered for slug: ${payload.slug}`,
    });
  }

  try {
    for (const tag of tags) {
      revalidateTag(tag, "max");
    }
    for (const path of paths) {
      revalidatePath(path);
    }

    logger.info("Applied cache revalidation", {
      requestId,
      slug: payload.slug,
      entityType: payload.entityType,
      operation: payload.operation,
      tags,
      paths,
    });

    return NextResponse.json({
      revalidated: true,
      source: payload.source,
      entityType: payload.entityType,
      slug: payload.slug,
      operation: payload.operation,
      tags,
      paths,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Revalidation execution failed", {
      requestId,
      slug: payload.slug,
      entityType: payload.entityType,
      operation: payload.operation,
      error,
    });
    return NextResponse.json({ revalidated: false, message: "Revalidation failed" }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    message: "Revalidation endpoint is active for Payload CMS internal webhooks.",
    docsUrl: "https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation",
  });
}
