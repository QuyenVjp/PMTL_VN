// @vitest-environment jsdom
/**
 * Component tests for ResetPasswordPage:
 * missing token, short password, mismatch, valid submit, API 400, network error, success.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const useSearchMock = vi.fn(() => ({ token: "valid-token-from-url" }));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...rest
  }: {
    children: ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useSearch: () => useSearchMock(),
}));

const postMock = vi.fn<(...args: unknown[]) => Promise<{ success: boolean }>>();
vi.mock("@/lib/api/admin-client", () => ({
  adminClient: {
    post: (path: string, body: unknown) => postMock(path, body),
  },
}));

import { ResetPasswordPage, RESET_PASSWORD_SUCCESS_COPY } from "./reset-password";
import { HttpError } from "@/lib/api/http-error";

function setInputValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  );
  descriptor?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("ResetPasswordPage", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let queryClient: QueryClient;

  beforeEach(() => {
    postMock.mockReset();
    useSearchMock.mockReturnValue({ token: "valid-token-from-url" });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    container?.remove();
    root = null;
    container = null;
    queryClient.clear();
  });

  function renderPage() {
    act(() => {
      root?.render(
        <QueryClientProvider client={queryClient}>
          <ResetPasswordPage />
        </QueryClientProvider>,
      );
    });
  }

  it("missing token shows safe alert and no form", () => {
    useSearchMock.mockReturnValue({ token: "" });
    renderPage();
    const missing = container!.querySelector(
      '[data-testid="reset-password-missing-token"]',
    );
    expect(missing).toBeTruthy();
    expect(container!.querySelector("form")).toBeNull();
    expect(postMock).not.toHaveBeenCalled();
  });

  it("short password shows field error without calling API", () => {
    renderPage();
    const password = container!.querySelector("#reset-password") as HTMLInputElement;
    const confirm = container!.querySelector("#reset-confirm") as HTMLInputElement;
    const form = container!.querySelector("form") as HTMLFormElement;

    act(() => {
      setInputValue(password, "short");
      setInputValue(confirm, "short");
    });
    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    const fieldError = container!.querySelector(
      '[data-testid="reset-password-field-error"]',
    );
    expect(fieldError?.textContent).toMatch(/8|ký tự|mật khẩu/i);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("password mismatch shows confirm field error", () => {
    renderPage();
    const password = container!.querySelector("#reset-password") as HTMLInputElement;
    const confirm = container!.querySelector("#reset-confirm") as HTMLInputElement;
    const form = container!.querySelector("form") as HTMLFormElement;

    act(() => {
      setInputValue(password, "LongEnough1!");
      setInputValue(confirm, "DifferentPass1!");
    });
    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    const fieldError = container!.querySelector(
      '[data-testid="reset-confirm-field-error"]',
    );
    expect(fieldError?.textContent).toMatch(/khớp|confirm|xác nhận/i);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("valid submit calls API with token + password", async () => {
    postMock.mockResolvedValueOnce({ success: true });
    renderPage();

    const password = container!.querySelector("#reset-password") as HTMLInputElement;
    const confirm = container!.querySelector("#reset-confirm") as HTMLInputElement;
    const form = container!.querySelector("form") as HTMLFormElement;

    act(() => {
      setInputValue(password, "LongEnough1!");
      setInputValue(confirm, "LongEnough1!");
    });

    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(postMock).toHaveBeenCalledWith("/auth/reset-password", {
      token: "valid-token-from-url",
      password: "LongEnough1!",
    });
  });

  it("API 400 expired/used token shows form error", async () => {
    postMock.mockRejectedValueOnce(
      new HttpError(400, {
        code: "BAD_REQUEST",
        message: "Token không hợp lệ hoặc đã hết hạn",
      }),
    );
    renderPage();

    const password = container!.querySelector("#reset-password") as HTMLInputElement;
    const confirm = container!.querySelector("#reset-confirm") as HTMLInputElement;
    const form = container!.querySelector("form") as HTMLFormElement;

    act(() => {
      setInputValue(password, "LongEnough1!");
      setInputValue(confirm, "LongEnough1!");
    });

    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
      await Promise.resolve();
    });

    const err = container!.querySelector('[data-testid="reset-password-error"]');
    expect(err?.textContent).toMatch(/hết hạn|không hợp lệ/i);
  });

  it("network error shows connection message", async () => {
    postMock.mockRejectedValueOnce(new Error("network down"));
    renderPage();

    const password = container!.querySelector("#reset-password") as HTMLInputElement;
    const confirm = container!.querySelector("#reset-confirm") as HTMLInputElement;
    const form = container!.querySelector("form") as HTMLFormElement;

    act(() => {
      setInputValue(password, "LongEnough1!");
      setInputValue(confirm, "LongEnough1!");
    });

    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
      await Promise.resolve();
    });

    const err = container!.querySelector('[data-testid="reset-password-error"]');
    expect(err?.textContent).toMatch(/kết nối|máy chủ/i);
  });

  it("success state shows success copy and login link", async () => {
    postMock.mockResolvedValueOnce({ success: true });
    renderPage();

    const password = container!.querySelector("#reset-password") as HTMLInputElement;
    const confirm = container!.querySelector("#reset-confirm") as HTMLInputElement;
    const form = container!.querySelector("form") as HTMLFormElement;

    act(() => {
      setInputValue(password, "LongEnough1!");
      setInputValue(confirm, "LongEnough1!");
    });

    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
      await Promise.resolve();
    });

    const success = container!.querySelector('[data-testid="reset-password-success"]');
    expect(success?.textContent).toContain(RESET_PASSWORD_SUCCESS_COPY);
  });
});
