"use server";

import { cookies } from "next/headers";
import { registerSchema } from "@pmtl/shared";

import { registerWithCMS } from "@/features/auth/api/cms-auth-client";
import { AUTH_COOKIE_MAX_AGE } from "@/features/auth/utils/auth-cookie";

type RegisterActionState = {
  success: boolean;
  message: string | null;
  fieldErrors: {
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
  };
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
};

export const initialRegisterActionState: RegisterActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

export async function submitRegisterAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const agreeToTerms = String(formData.get("agreeToTerms") ?? "");

  const parsed = registerSchema.safeParse({
    displayName,
    email,
    password,
  });

  const fieldErrors: RegisterActionState["fieldErrors"] = {};

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    fieldErrors.displayName = flattened.displayName?.[0];
    fieldErrors.email = flattened.email?.[0];
    fieldErrors.password = flattened.password?.[0];
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  if (agreeToTerms !== "on") {
    fieldErrors.agreeToTerms = "Vui lòng đồng ý với điều khoản.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "Thông tin đăng ký chưa hợp lệ.",
      fieldErrors,
    };
  }

  try {
    const payload = await registerWithCMS({
      displayName,
      email,
      password,
    });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", payload.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    cookieStore.set("pmtl-session", payload.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
    });

    return {
      success: true,
      message: "Đăng ký thành công.",
      fieldErrors: {},
      user: {
        id: payload.session.user.id,
        email: payload.session.user.email,
        displayName: payload.session.user.displayName,
        role: payload.session.user.role,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi máy chủ.",
      fieldErrors: {},
    };
  }
}
