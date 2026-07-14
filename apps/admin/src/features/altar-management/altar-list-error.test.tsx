// @vitest-environment jsdom
/**
 * Plans 0.4 — representative management list 500 / error state.
 *
 * When the protocol-templates query fails (e.g. HTTP 500), the page must show
 * a destructive error surface and must NOT fall through to the empty table UX.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpError } from "@/lib/api/http-error";

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
  useNavigate: () => vi.fn(),
}));

const getMock = vi.fn<(...args: unknown[]) => Promise<unknown>>();
vi.mock("@/lib/api/admin-client", () => ({
  adminClient: {
    get: (...args: unknown[]) => getMock(...args),
  },
}));

// Import after mocks
import { AltarProceduresPage } from "./altar-procedures-page";

describe("AltarProceduresPage list error state", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let queryClient: QueryClient;

  beforeEach(() => {
    getMock.mockReset();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
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
          <AltarProceduresPage />
        </QueryClientProvider>,
      );
    });
  }

  it("shows error surface (not empty table) when list query returns 500", async () => {
    getMock.mockRejectedValueOnce(
      new HttpError(500, {
        code: "INTERNAL_ERROR",
        message: "Lỗi máy chủ",
      }),
    );

    renderPage();

    // Poll until react-query settles the rejected query and React re-renders.
    let text = "";
    for (let i = 0; i < 50; i++) {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });
      text = container!.textContent ?? "";
      if (/Không tải được danh sách quy trình bàn thờ/i.test(text)) break;
    }

    expect(text).toMatch(/Không tải được danh sách quy trình bàn thờ/i);
    // Must not look like a successful empty dataset
    expect(text).not.toMatch(/Không có kết quả phù hợp/i);
  });
});
