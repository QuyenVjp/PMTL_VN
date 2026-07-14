// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
} from "./schemas";

describe("forgotPasswordFormSchema", () => {
  it("accepts a valid email", () => {
    const result = forgotPasswordFormSchema.safeParse({ email: "admin@pmtl.local" });
    expect(result.success).toBe(true);
  });

  it("rejects empty email with Vietnamese message", () => {
    const result = forgotPasswordFormSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/không được để trống|không hợp lệ/i);
    }
  });

  it("rejects invalid email with Vietnamese message", () => {
    const result = forgotPasswordFormSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Email không hợp lệ");
    }
  });
});

describe("resetPasswordFormSchema", () => {
  it("accepts matching passwords with valid token", () => {
    const result = resetPasswordFormSchema.safeParse({
      token: "abc123",
      password: "newpass12",
      confirmPassword: "newpass12",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = resetPasswordFormSchema.safeParse({
      token: "abc123",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordIssue = result.error.issues.find((i) => i.path[0] === "password");
      expect(passwordIssue?.message).toBe("Mật khẩu phải có ít nhất 8 ký tự");
    }
  });

  it("rejects mismatched confirm password", () => {
    const result = resetPasswordFormSchema.safeParse({
      token: "abc123",
      password: "newpass12",
      confirmPassword: "otherpass",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmIssue = result.error.issues.find((i) => i.path[0] === "confirmPassword");
      expect(confirmIssue?.message).toBe("Mật khẩu xác nhận không khớp");
    }
  });

  it("rejects missing token", () => {
    const result = resetPasswordFormSchema.safeParse({
      token: "",
      password: "newpass12",
      confirmPassword: "newpass12",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const tokenIssue = result.error.issues.find((i) => i.path[0] === "token");
      expect(tokenIssue?.message).toBe("Thiếu mã đặt lại mật khẩu");
    }
  });
});
