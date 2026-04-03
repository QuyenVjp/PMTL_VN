/**
 * AdminDetailPage — Strapi v5 style full-page detail/create layout.
 *
 * Design:
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ ← [backLabel]   [title]  [status]   │   [Save] [⋯ more]  │  sticky header
 *   ├────────────────────────────────────────────────────────────┤
 *   │  ┌─────────────────────────────────┐ ┌──────────────────┐ │
 *   │  │  main content (flex-1)          │ │ sidebar (320px)  │ │
 *   │  └─────────────────────────────────┘ └──────────────────┘ │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Usage:
 *   <AdminDetailPage
 *     backHref="/noi-dung/bai-viet"
 *     backLabel="Bài viết"
 *     title="Tên bài viết"
 *     status={<Badge>Nháp</Badge>}
 *     onSave={handleSave}
 *     isSaving={mutation.isPending}
 *     saveLabel="Lưu"
 *     actions={[{ label: "Xuất bản", onClick: publish }, { label: "Xoá", onClick: setConfirm, variant: "destructive" }]}
 *     sidebar={<MetadataSidebar />}
 *   >
 *     <FormFields />
 *   </AdminDetailPage>
 *
 * Companion exports (same barrel):
 *   AdminDetailSection  — titled card section
 *   AdminDetailField    — label / value row (read mode)
 */
import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────

export type AdminDetailAction = {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline";
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  separator?: boolean;
};

export interface AdminDetailPageProps {
  /** Route href to navigate back to, e.g. "/noi-dung/bai-viet" */
  backHref: string;
  /** Label for the back link, e.g. "Bài viết" */
  backLabel: string;
  /** Record title or "Tạo mới" */
  title: string;
  /** Status badge / indicator */
  status?: ReactNode;
  /** Called on primary save/create button click */
  onSave?: () => void;
  /** Whether save is in flight */
  isSaving?: boolean;
  /** Primary button label — defaults to "Lưu" */
  saveLabel?: string;
  /** Disable save button */
  saveDisabled?: boolean;
  /** Secondary actions rendered in ⋯ dropdown */
  actions?: AdminDetailAction[];
  /** Main content (left/wider column) */
  children: ReactNode;
  /** Optional right sidebar column (metadata, status panel, etc.) */
  sidebar?: ReactNode;
  /** Extra content rendered BELOW the two-column body (e.g. tabs) */
  footer?: ReactNode;
}

// ── Shell ─────────────────────────────────────────────────────────────

export function AdminDetailPage({
  backHref,
  backLabel,
  title,
  status,
  onSave,
  isSaving = false,
  saveLabel = "Lưu",
  saveDisabled = false,
  actions = [],
  children,
  sidebar,
  footer,
}: AdminDetailPageProps) {
  const hasActions = actions.length > 0;

  return (
    <div className="flex min-h-full flex-col">
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-4 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4 border-b">
          {/* Left: back + breadcrumb */}
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={backHref}
              className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>

            <Separator orientation="vertical" className="h-4 shrink-0" />

            <h1 className="truncate text-sm font-semibold">{title}</h1>

            {status && <div className="shrink-0">{status}</div>}
          </div>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center gap-2">
            {onSave && (
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving || saveDisabled}
              >
                {isSaving ? "Đang lưu..." : saveLabel}
              </Button>
            )}

            {hasActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2">
                    <MoreHorizontalIcon className="size-4" />
                    <span className="sr-only">Thêm hành động</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                  {actions.map((action, i) => (
                    <span key={i}>
                      {action.separator && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={
                          action.variant === "destructive"
                            ? "text-destructive focus:text-destructive"
                            : undefined
                        }
                      >
                        {action.icon && (
                          <action.icon className="mr-2 size-4" />
                        )}
                        {action.label}
                      </DropdownMenuItem>
                    </span>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-6 py-6">
        {sidebar ? (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Main content */}
            <div className="min-w-0 flex-1 space-y-6">{children}</div>
            {/* Sidebar */}
            <div className="w-full shrink-0 space-y-4 lg:w-80">{sidebar}</div>
          </div>
        ) : (
          <div className="space-y-6">{children}</div>
        )}

        {footer && <div>{footer}</div>}
      </div>
    </div>
  );
}

// ── AdminDetailSection ────────────────────────────────────────────────

/**
 * AdminDetailSection — Card section for grouping fields in the detail page.
 * Use inside AdminDetailPage children or sidebar.
 */
export interface AdminDetailSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AdminDetailSection({
  title,
  description,
  children,
  className,
}: AdminDetailSectionProps) {
  if (!title) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ── AdminDetailField ─────────────────────────────────────────────────

/**
 * AdminDetailField — Label / value row for read-mode fields in sidebar.
 */
export interface AdminDetailFieldProps {
  label: string;
  value?: ReactNode;
  stacked?: boolean;
  className?: string;
}

export function AdminDetailField({
  label,
  value,
  stacked = false,
  className,
}: AdminDetailFieldProps) {
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
        "flex items-start justify-between gap-3 border-b border-dashed border-border/40 py-2.5 text-sm last:border-0",
        className,
      )}
    >
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? empty}</span>
    </div>
  );
}

// ── FormField helper ─────────────────────────────────────────────────

/**
 * AdminFormField — labeled form field wrapper.
 * Consistent with existing Field pattern across the admin.
 */
export function AdminFormField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid items-start content-start self-start gap-1.5", className)}>
      <span className="block self-start justify-self-start text-sm font-medium leading-none">{label}</span>
      {children}
      {hint && <span className="block self-start justify-self-start text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
