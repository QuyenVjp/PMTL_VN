/**
 * Sidebar Store — Zustand UI state for sidebar collapsed/expanded
 *
 * Constitution: design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md
 * - "Client state: Zustand (minimal) — chỉ cho UI state (sidebar, modal, theme)"
 * - Canon structure: stores/sidebar.ts
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: (collapsed: boolean) => set({ collapsed }),
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: "pmtl-admin-sidebar" },
  ),
);
