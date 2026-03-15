import { NextRequest, NextResponse } from "next/server";

import { buildCMSUrl } from "@/lib/cms/client";
import { logger } from "@/lib/logger";
import { normalizeApiErrorMessage, parseResponseBody } from "@/lib/http-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;

  try {
    const response = await fetch(buildCMSUrl(`/api/comments/${encodeURIComponent(documentId)}/like`), {
      method: "POST",
      cache: "no-store",
    });
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      return NextResponse.json(
        { error: normalizeApiErrorMessage(payload, response.status, "Không thể thích bình luận") },
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    logger.error("Failed to like post comment", {
      error,
      path: request.nextUrl.pathname,
      documentId,
    });

    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
