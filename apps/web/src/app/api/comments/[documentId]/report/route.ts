import { NextRequest, NextResponse } from "next/server";
import { commentReportSchema } from "@pmtl/shared";

import { buildCMSUrl } from "@/lib/cms/client";
import { logger } from "@/lib/logger";
import { normalizeApiErrorMessage, parseResponseBody } from "@/lib/http-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;

  try {
    const body = commentReportSchema.parse(await request.json());
    const response = await fetch(buildCMSUrl(`/api/comments/${encodeURIComponent(documentId)}/report`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      return NextResponse.json(
        { error: normalizeApiErrorMessage(payload, response.status, "Không thể báo cáo bình luận") },
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu báo cáo không hợp lệ." }, { status: 400 });
    }

    logger.error("Failed to report post comment", {
      error,
      path: request.nextUrl.pathname,
      documentId,
    });

    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
