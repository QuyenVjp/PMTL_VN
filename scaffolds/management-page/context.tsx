/**
 * SCAFFOLD — context.tsx
 *
 * Replace every occurrence of:
 *   [Feature]   → your PascalCase feature name (e.g. Guide, CommunityPost)
 *   [feature]   → your camelCase feature name  (e.g. guide, communityPost)
 *   [features]  → your plural camelCase name   (e.g. guides, communityPosts)
 */
import React, { createContext, useContext, useState } from "react";
import type { [Feature]Item } from "@/features/[features]/queries";

// ── Dialog type — always include "detail" and null ────────────────────

export type [Feature]DialogType = "create" | "detail" | "delete" | null;
// Add "publish" if the feature has a publish workflow.
// Never use numeric enums — string literals only.

// ── Context shape ─────────────────────────────────────────────────────

type [Feature]sContextValue = {
  open: [Feature]DialogType;
  currentRow: [Feature]Item | null;
  setOpen: (value: [Feature]DialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<[Feature]Item | null>>;
};

const [Feature]sContext = createContext<[Feature]sContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────

export function [Feature]sProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<[Feature]DialogType>(null);
  const [currentRow, setCurrentRow] = useState<[Feature]Item | null>(null);

  return (
    <[Feature]sContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </[Feature]sContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────

export function use[Feature]s() {
  const context = useContext([Feature]sContext);
  if (!context) throw new Error("use[Feature]s must be used within [Feature]sProvider");
  return context;
}
