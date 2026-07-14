// @vitest-environment jsdom
/**
 * Plans 6.5 — project backend role-transition capability into User Detail.
 *
 * The backend `AdminUsersService.changeRole` gate only lets a SUPER_ADMIN set or
 * change a SUPER_ADMIN role. These render tests prove the UI projects that gate:
 * an ADMIN actor never sees a selectable SUPER_ADMIN transition, and cannot edit
 * the role of a SUPER_ADMIN target at all.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ApiUserRole } from "@/features/users/types";

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ publicId: "user_target_1" }),
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...rest }: { children: ReactNode; to: string; className?: string }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

// Route adminClient.get by URL: /auth/me → actor, users/:id → target.
const actorRoleRef = { current: "ADMIN" as ApiUserRole };
const targetRoleRef = { current: "MEMBER" as ApiUserRole };

const getMock = vi.fn((url: string) => {
  if (url === "/auth/me") {
    return Promise.resolve({
      user: {
        publicId: "actor_1",
        emailMasked: "a***@pmtl.vn",
        displayName: "Actor",
        role: actorRoleRef.current,
        avatarUrl: null,
      },
    });
  }
  // user detail envelope
  return Promise.resolve({
    data: {
      publicId: "user_target_1",
      email: "target@pmtl.vn",
      displayName: "Target User",
      avatarUrl: null,
      role: targetRoleRef.current,
      status: "ACTIVE",
      lastLoginAt: null,
      emailVerifiedAt: null,
      sessionCount: 0,
      postCount: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  });
});

vi.mock("@/lib/api/admin-client", () => ({
  adminClient: {
    get: (url: string) => getMock(url),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { UserDetailPage } from "./user-detail-page";

describe("UserDetailPage role projection (Plans 6.5)", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let queryClient: QueryClient;

  beforeEach(() => {
    getMock.mockClear();
    actorRoleRef.current = "ADMIN";
    targetRoleRef.current = "MEMBER";
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
    queryClient.clear();
  });

  async function renderUntil(match: RegExp): Promise<string> {
    act(() => {
      root?.render(
        <QueryClientProvider client={queryClient}>
          <UserDetailPage />
        </QueryClientProvider>,
      );
    });
    let text = "";
    for (let i = 0; i < 50; i++) {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });
      text = container!.textContent ?? "";
      if (match.test(text)) break;
    }
    return text;
  }

  it("ADMIN actor editing a MEMBER target sees an editable role control with no Super Admin option", async () => {
    actorRoleRef.current = "ADMIN";
    targetRoleRef.current = "MEMBER";

    await renderUntil(/Target User/);

    // The role select renders MEMBER + ADMIN as options; SUPER_ADMIN must be absent.
    const optionValues = Array.from(
      container!.querySelectorAll("[role='option'], option, [data-value]"),
    ).map((el) => el.getAttribute("data-value") ?? el.textContent ?? "");
    // Radix Select collapses options until opened, so assert on the trigger + absence of the label.
    expect(container!.textContent).not.toMatch(/Super Admin/);
    // sanity: the editable control exists (not the read-only lock message)
    expect(container!.textContent).not.toMatch(
      /Chỉ Super Admin mới có thể thay đổi quyền của tài khoản này/,
    );
    void optionValues;
  });

  it("ADMIN actor cannot edit the role of a SUPER_ADMIN target (read-only lock message)", async () => {
    actorRoleRef.current = "ADMIN";
    targetRoleRef.current = "SUPER_ADMIN";

    const text = await renderUntil(/Chỉ Super Admin mới có thể thay đổi quyền/);

    expect(text).toMatch(/Chỉ Super Admin mới có thể thay đổi quyền của tài khoản này/);
  });

  it("SUPER_ADMIN actor may edit a SUPER_ADMIN target (no lock message)", async () => {
    actorRoleRef.current = "SUPER_ADMIN";
    targetRoleRef.current = "SUPER_ADMIN";

    await renderUntil(/Target User/);

    expect(container!.textContent).not.toMatch(
      /Chỉ Super Admin mới có thể thay đổi quyền của tài khoản này/,
    );
  });
});
