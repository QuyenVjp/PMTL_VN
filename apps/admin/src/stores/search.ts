/**
 * Search/Command Palette Store — Zustand UI state
 *
 * Constitution: design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md
 * - "Client state: Zustand (minimal) — chỉ cho UI state (sidebar, modal, theme)"
 * - "Command palette (⌘K) cho admin navigation"
 *
 * Replaces context/search-provider.tsx.
 * Keyboard shortcut (⌘K / Ctrl+K) registered in useCommandPaletteShortcut().
 */
import { create } from "zustand";

interface SearchState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  toggleOpen: () => set((s) => ({ open: !s.open })),
}));

/** Hook-compatible API matching the old useSearch() signature */
export function useSearch() {
  const open = useSearchStore((s) => s.open);
  const setOpen = useSearchStore((s) => s.setOpen);
  const toggleOpen = useSearchStore((s) => s.toggleOpen);
  return { open, setOpen, toggleOpen };
}
