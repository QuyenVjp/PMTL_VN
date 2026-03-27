/**
 * CommandPaletteShortcut — keyboard shortcut handler for ⌘K / Ctrl+K
 *
 * Extracted from context/search-provider.tsx into a standalone component
 * that reads from the Zustand search store.
 * Render once in the app root.
 */
import { useEffect } from "react";
import { useSearchStore } from "./search.js";

export function CommandPaletteShortcut() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        useSearchStore.getState().toggleOpen();
      }

      if (event.key === "Escape") {
        useSearchStore.getState().setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
