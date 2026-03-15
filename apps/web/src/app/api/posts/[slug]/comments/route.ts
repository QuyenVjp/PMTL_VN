import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { commentThreadQuerySchema, legacyCommentSubmitSchema } from "@pmtl/shared";

import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/features/auth/utils/auth-cookie";
import { buildCMSUrl } from "@/lib/cms/client";
import { normalizeApiErrorMessage, parseResponseBody } from "@/lib/http-error";
import { logger } from "@/lib/logger";
import { getCommentsByPostSlug } from "@/lib/api/comments";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const parsed = commentThreadQuerySchema.parse({
      page: request.nextUrl.searchParams.get("page") ?? "1",
      pageSize: request.nextUrl.searchParams.get("pageSize") ?? "20",
    });

    const data = await getCommentsByPostSlug(slug, parsed.page, parsed.pageSize);

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Tham số phân trang không hợp lệ." }, { status: 400 });
    }

    logger.error("Failed to load post comments", {
      error,
      path: request.nextUrl.pathname,
    });

    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const authToken =
    cookieStore.get(AUTH_COOKIE_NAME)?.value ?? cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;

  try {
    const body = legacyCommentSubmitSchema.parse(await request.json());
    const forwardedFor =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Forwarded-For": forwardedFor,
      "User-Agent": request.headers.get("user-agent") ?? "",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(buildCMSUrl(`/api/posts/${encodeURIComponent(slug)}/comments/submit`), {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: body.content,
        authorName: body.authorName,
        authorAvatar: body.authorAvatar,
        parentPublicId: body.parentDocumentId,
      }),
      cache: "no-store",
    });

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: normalizeApiErrorMessage(payload, response.status, "Gửi bình luận thất bại"),
          details: payload,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu bình luận không hợp lệ." }, { status: 400 });
    }

    logger.error("Failed to submit post comment", {
      error,
      path: request.nextUrl.pathname,
      slug,
    });

    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
