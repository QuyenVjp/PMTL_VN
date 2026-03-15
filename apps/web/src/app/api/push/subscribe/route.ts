import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { normalizeApiErrorMessage, parseResponseBody } from "@/lib/http-error";
import { buildCMSUrl } from "@/lib/cms/client";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/features/auth/utils/auth-cookie";

const CMS_API_TOKEN = process.env.PAYLOAD_API_TOKEN?.trim();

function mapNotificationTypesToPrefs(notificationTypes: unknown) {
  const types = Array.isArray(notificationTypes)
    ? notificationTypes.filter((value): value is string => typeof value === "string")
    : [];

  return {
    posts: types.includes("content_update") || types.includes("daily_chant"),
    events: types.includes("event_reminder"),
    community: types.includes("community"),
  };
}

async function cmsRequest(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(AUTH_COOKIE_NAME)?.value ??
    cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value ??
    CMS_API_TOKEN;

  return fetch(buildCMSUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      subscription?: {
        endpoint?: string;
        keys?: {
          p256dh?: string;
          auth?: string;
        };
      };
      notificationTypes?: unknown;
      userId?: unknown;
    };
    const { subscription, notificationTypes, userId } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: "Dữ liệu subscription không hợp lệ" }, { status: 400 });
    }

    const response = await cmsRequest("/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        timezone: "Asia/Ho_Chi_Minh",
        notificationPrefs: mapNotificationTypesToPrefs(notificationTypes),
        ...(typeof userId === "number" ? { user: userId } : {}),
        isActive: true,
      }),
    });

    if (!response.ok) {
      const err = await parseResponseBody(response);
      return NextResponse.json(
        { error: normalizeApiErrorMessage(err, response.status, "Không thể đăng ký thông báo") },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as { endpoint?: string };
    const { endpoint } = body;
    if (!endpoint) {
      return NextResponse.json({ error: "Thiếu endpoint" }, { status: 400 });
    }

    const response = await cmsRequest("/api/push/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      const err = await parseResponseBody(response);
      return NextResponse.json(
        { error: normalizeApiErrorMessage(err, response.status, "Không thể hủy thông báo") },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
