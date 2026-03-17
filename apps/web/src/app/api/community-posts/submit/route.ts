import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { communityPostSubmitSchema, slugify } from "@pmtl/shared";

import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/features/auth/utils/auth-cookie";
import { normalizeApiErrorMessage, parseResponseBody } from "@/lib/http-error";
import { logger } from "@/lib/logger";
import { CORRELATION_ID_HEADER } from "@/lib/security/request-context";

const CMS_API_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? "http://localhost:3001";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để gửi bài cộng đồng." }, { status: 401 });
  }

  try {
    const rawBody: unknown = await request.json();
    const parsedBody = communityPostSubmitSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu bài viết không hợp lệ.",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const tags = Array.isArray(parsedBody.data.tags)
      ? parsedBody.data.tags
      : typeof parsedBody.data.tags === "string"
        ? parsedBody.data.tags.split(",").map((value) => value.trim()).filter(Boolean)
        : [];

    const res = await fetch(`${CMS_API_URL}/api/community/posts/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        [CORRELATION_ID_HEADER]: request.headers.get(CORRELATION_ID_HEADER) ?? crypto.randomUUID(),
      },
      body: JSON.stringify({
        title: parsedBody.data.title,
        content: parsedBody.data.content,
        type: parsedBody.data.type,
        category: parsedBody.data.category,
        slug: slugify(parsedBody.data.title),
        videoURL: parsedBody.data.video_url ?? "",
        tags,
      }),
    });

    const data: unknown = await parseResponseBody(res);
    if (!res.ok) {
      return NextResponse.json(
        {
          error: normalizeApiErrorMessage(data, res.status, "Gửi bài cộng đồng thất bại"),
          details: data,
        },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    logger.error("Community post submit proxy crashed", { error });
    return NextResponse.json({ error: "Lỗi máy chủ." }, { status: 500 });
  }
}
