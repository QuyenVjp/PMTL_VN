"use server";

import { guestbookFormSchema } from "@/lib/validation/guestbook";
import { normalizeApiErrorMessage } from "@/lib/http-error";

type GuestbookActionState = {
  success: boolean;
  message: string | null;
  fieldErrors: {
    authorName?: string;
    questionCategory?: string;
    message?: string;
  };
};

export const initialGuestbookActionState: GuestbookActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

export async function submitGuestbookAction(
  _prevState: GuestbookActionState,
  formData: FormData,
): Promise<GuestbookActionState> {
  const payload = {
    authorName: String(formData.get("authorName") ?? "").trim(),
    entryType: String(formData.get("entryType") ?? "message"),
    questionCategory: String(formData.get("questionCategory") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  const parsed = guestbookFormSchema.safeParse(payload);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Lưu bút chưa hợp lệ.",
      fieldErrors: {
        authorName: flattened.authorName?.[0],
        questionCategory: flattened.questionCategory?.[0],
        message: flattened.message?.[0],
      },
    };
  }

  const token = process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN;

  if (!token) {
    return {
      success: false,
      message: "Cấu hình token guestbook đang thiếu.",
      fieldErrors: {},
    };
  }

  try {
    const cmsUrl =
      process.env.PAYLOAD_PUBLIC_SERVER_URL ??
      process.env.CMS_PUBLIC_URL ??
      "http://localhost:3001";

    const response = await fetch(`${cmsUrl}/api/guestbook/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Forwarded-For": "127.0.0.1",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        message: normalizeApiErrorMessage(responseBody, response.status, "Không thể gửi lưu bút."),
        fieldErrors: {},
      };
    }

    return {
      success: true,
      message: "Lưu bút của bạn đã được ghi lại.",
      fieldErrors: {},
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi máy chủ.",
      fieldErrors: {},
    };
  }
}
