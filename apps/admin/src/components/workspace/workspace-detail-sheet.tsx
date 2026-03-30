/**
 * WorkspaceDetailSheet — Generic detail panel (right-side Sheet).
 *
 * Pattern: table has quick actions only; all view/edit/delete live here.
 *
 * ─ Design rules ──────────────────────────────────────────────────────
 * • This component is a SHELL — it owns layout, header, scroll area,
 *   footer delete button, and the internal delete-confirm dialog.
 * • Domain content (field sections, edit forms, previews) is passed as
 *   `children` — features own what's inside.
 * • `primaryActions` slot is for status transitions (Xuất bản, Gỡ xuất
 *   bản, Lưu thay đổi). Keep it to ≤ 3 buttons.
 * • `onDelete` is optional — omit it for read-only detail views.
 * ─────────────────────────────────────────────────────────────────────
 *
 * Companion primitives (same file, same barrel):
 *   WorkspaceDetailSection  — section with optional label
 *   WorkspaceDetailField    — label / value row
 *   WorkspaceDetailDivider  — thin separator between sections
 */
import { useState } from "react";
import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { WorkspaceConfirmDialog } from "@/components/workspace/workspace-confirm-dialog";
import { cn } from "@/lib/utils";

// ── Shell ─────────────────────────────────────────────────────────────

export interface WorkspaceDetailSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Primary record name shown in the sheet header */
  title: string;
  /** Secondary line below title (e.g. "Tạo bởi PMTL Admin · 30/3/2026") */
  subtitle?: string;
  /** Status badge or indicator rendered below the title */
  status?: React.ReactNode;
  /**
   * Action buttons rendered in the header bar.
   * Typical use: Edit (toggle mode), Publish, Unpublish.
   * Keep to ≤ 3 small/sm buttons.
   */
  primaryActions?: React.ReactNode;
  /**
   * When provided, a red "Xoá" footer button appears and triggers
   * an internal `WorkspaceConfirmDialog` before calling this fn.
   */
  onDelete?: () => void;
  /** Label for the confirm dialog — e.g. the record's title */
  deleteItemName?: string;
  /** Pass mutation.isPending to disable the confirm button */
  isPendingDelete?: boolean;
  children: React.ReactNode;
}

export function WorkspaceDetailSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  status,
  primaryActions,
  onDelete,
  deleteItemName,
  isPendingDelete = false,
  children,
}: WorkspaceDetailSheetProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    onDelete?.();
    setConfirmDelete(false);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="flex w-full flex-col gap-0 p-0 sm:max-w-[500px]"
          side="right"
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <SheetHeader className="shrink-0 border-b px-6 pb-4 pt-6">
            <div className="min-w-0">
              <SheetTitle className="truncate text-base font-semibold leading-snug">
                {title}
              </SheetTitle>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
              )}
              {status && <div className="mt-2">{status}</div>}
            </div>

            {primaryActions && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {primaryActions}
              </div>
            )}
          </SheetHeader>

          {/* ── Scrollable body ────────────────────────────────────── */}
          <ScrollArea className="flex-1">
            <div className="space-y-6 px-6 py-5">{children}</div>
          </ScrollArea>

          {/* ── Delete footer ──────────────────────────────────────── */}
          {onDelete && (
            <div className="shrink-0 border-t px-6 py-4">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => setConfirmDelete(true)}
                disabled={isPendingDelete}
              >
                <Trash2Icon className="mr-2 size-4" />
                Xoá
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Internal delete confirm — outside Sheet to avoid z-index trap */}
      {onDelete && (
        <WorkspaceConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Xoá mục này?"
          description={
            deleteItemName ? (
              <>
                Xoá{" "}
                <span className="font-semibold text-foreground">{deleteItemName}</span>?
                {" "}Thao tác này không thể hoàn tác.
              </>
            ) : (
              "Thao tác này không thể hoàn tác."
            )
          }
          confirmLabel="Xoá"
          variant="destructive"
          isPending={isPendingDelete}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

// ── Section ───────────────────────────────────────────────────────────

/**
 * WorkspaceDetailSection
 *
 * Groups related fields inside the detail sheet.
 * Use `title` for section labels like "Thông tin", "Chỉnh sửa", "Metadata".
 */
export interface WorkspaceDetailSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function WorkspaceDetailSection({
  title,
  children,
  className,
}: WorkspaceDetailSectionProps) {
  return (
    <section className={cn("space-y-1", className)}>
      {title && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      )}
      {children}
    </section>
  );
}

// ── Field ─────────────────────────────────────────────────────────────

/**
 * WorkspaceDetailField
 *
 * Single label / value row for readonly field display.
 * Stack multiple inside a WorkspaceDetailSection.
 */
export interface WorkspaceDetailFieldProps {
  label: string;
  value?: React.ReactNode;
  /** Makes value span full width below label (use for long text) */
  stacked?: boolean;
  className?: string;
}

export function WorkspaceDetailField({
  label,
  value,
  stacked = false,
  className,
}: WorkspaceDetailFieldProps) {
  const empty = (
    <span className="text-xs italic text-muted-foreground/50">—</span>
  );

  if (stacked) {
    return (
      <div className={cn("space-y-1 py-2 text-sm", className)}>
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="font-medium">{value ?? empty}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-dashed border-border/40 py-2 text-sm last:border-0",
        className,
      )}
    >
      <span className="min-w-[100px] shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? empty}</span>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────

/** Thin separator between detail sections — a lighter alternative to WorkspaceDetailSection titles */
export function WorkspaceDetailDivider({ className }: { className?: string }) {
  return <hr className={cn("border-border/30", className)} />;
}
