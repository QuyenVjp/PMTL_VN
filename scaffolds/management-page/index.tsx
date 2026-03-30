/**
 * SCAFFOLD — index.tsx
 *
 * Page entry point. This file:
 *   - Wraps everything in the Provider
 *   - Renders the header + primary action button
 *   - Wires Table + Dialogs + DetailSheet
 *   - Contains ZERO business logic
 *
 * Constitution §1: index.tsx wires Provider + Table + Dialogs. Zero business logic.
 */
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { [Feature]sProvider, use[Feature]s } from "@/features/[features]/context";
import { [Feature]sDialogs } from "@/features/[features]/[features]-dialogs";
import { [Feature]sDetailSheet } from "@/features/[features]/[features]-detail";
import { [Feature]sTable } from "@/features/[features]/[features]-table";

// ── Primary action button (needs context so lives inside Provider) ────

function [Feature]sPrimaryButtons() {
  const { setOpen } = use[Feature]s();
  return (
    <Button onClick={() => setOpen("create")}>
      <PlusIcon className="size-4" />
      Thêm mới
    </Button>
  );
}

// ── Detail sheet portal (renders outside table to avoid z-index issues)

function [Feature]sDetailPortal() {
  const { open, currentRow, setOpen, setCurrentRow } = use[Feature]s();
  if (!currentRow) return null;
  const handleClose = () => { setOpen(null); setCurrentRow(null); };
  return (
    <[Feature]sDetailSheet
      open={open === "detail"}
      onClose={handleClose}
      currentRow={currentRow}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function [Feature]sPage() {
  return (
    <[Feature]sProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">[Page title]</h1>
            <p className="mt-2 text-sm text-muted-foreground">[Page description]</p>
          </div>
          <[Feature]sPrimaryButtons />
        </div>

        <[Feature]sTable />
      </div>

      <[Feature]sDialogs />
      <[Feature]sDetailPortal />
    </[Feature]sProvider>
  );
}
