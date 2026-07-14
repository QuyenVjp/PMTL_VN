// @vitest-environment jsdom
/**
 * Plans 0.4 — list 500 / error-vs-empty baseline.
 *
 * WorkspaceTableShell is the shared list shell: isError must render a distinct
 * error surface (not the empty message). Representative management lists wire
 * react-query isError into this shell or an equivalent red card.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { WorkspaceTableShell } from "./workspace-table-shell";

describe("WorkspaceTableShell error vs empty", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
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
  });

  it("renders error card (not empty message) when isError is true", () => {
    act(() => {
      root?.render(
        <WorkspaceTableShell
          isLoading={false}
          isError
          isEmpty={false}
          errorMessage="Không tải được danh sách. Mã lỗi 500."
          emptyMessage="Chưa có dữ liệu nào."
        >
          <div data-testid="table-body">should not show</div>
        </WorkspaceTableShell>,
      );
    });

    const text = container!.textContent ?? "";
    expect(text).toContain("Không tải được danh sách. Mã lỗi 500.");
    expect(text).not.toContain("Chưa có dữ liệu nào.");
    expect(container!.querySelector('[data-testid="table-body"]')).toBeNull();
  });

  it("renders empty message only when not error and empty", () => {
    act(() => {
      root?.render(
        <WorkspaceTableShell
          isLoading={false}
          isError={false}
          isEmpty
          emptyMessage="Chưa có dữ liệu nào."
        >
          <div data-testid="table-body">hidden</div>
        </WorkspaceTableShell>,
      );
    });

    expect(container!.textContent).toContain("Chưa có dữ liệu nào.");
    expect(container!.querySelector('[data-testid="table-body"]')).toBeNull();
  });

  it("renders children when data is present", () => {
    act(() => {
      root?.render(
        <WorkspaceTableShell isLoading={false} isError={false} isEmpty={false}>
          <div data-testid="table-body">rows</div>
        </WorkspaceTableShell>,
      );
    });

    expect(container!.querySelector('[data-testid="table-body"]')?.textContent).toBe(
      "rows",
    );
  });
});
