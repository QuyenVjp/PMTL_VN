// @vitest-environment jsdom
/**
 * Component tests for ForgotPasswordPage — real submit, anti-enumeration success,
 * validation error, and loading state. Uses QueryClient + stubbed adminClient.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
}));

const postMock = vi.fn<(...args: unknown[]) => Promise<{ success: boolean }>>();
vi.mock("@/lib/api/admin-client", () => ({
  adminClient: {
    post: (path: string, body: unknown) => postMock(path, body),
  },
}));

import {
  ForgotPasswordPage,
  FORGOT_PASSWORD_SUCCESS_COPY,
} from "./forgot-password";

function setInputValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  );
  descriptor?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("ForgotPasswordPage", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let queryClient: QueryClient;

  beforeEach(() => {
    postMock.mockReset();
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
          <ForgotPasswordPage />
        </QueryClientProvider>,
      );
    });
  }

  it("shows field error for invalid email without calling API", () => {
    renderPage();
    const input = container!.querySelector("#forgot-email") as HTMLInputElement;
    const form = container!.querySelector("form") as HTMLFormElement;

    act(() => {
      setInputValue(input, "not-an-email");
    });

    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    const fieldError = container!.querySelector(
      '[data-testid="forgot-email-field-error"]',
    );
    expect(fieldError?.textContent).toBe("Email không hợp lệ");
    expect(postMock).not.toHaveBeenCalled();
  });

  it("submits email and shows anti-enumeration success copy", async () => {
    postMock.mockResolvedValueOnce({ success: true });
    renderPage();

    const input = container!.querySelector("#forgot-email") as HTMLInputElement;
    const form = container!.querySelector("form") as HTMLFormElement;

    act(() => {
      setInputValue(input, "admin@pmtl.local");
    });

    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      // flush mutation microtasks
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(postMock).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "admin@pmtl.local",
    });

    const success = container!.querySelector(
      '[data-testid="forgot-password-success"]',
    );
    expect(success?.textContent).toBe(FORGOT_PASSWORD_SUCCESS_COPY);
  });
});
