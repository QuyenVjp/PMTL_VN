/**
 * Pagination component.
 *
 * Ported from Shadboard, adapted for PMTL admin:
 * - Replaced next/link with native <a> + buttonVariants (framework-agnostic)
 * - Vietnamese labels
 */

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      data-slot="pagination"
      role="navigation"
      className={cn("mx-auto flex w-full justify-center", className)}
      aria-label="Phân trang"
      {...props}
    />
  );
}

export function PaginationContent({
  className,
  ...props
}: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

export function PaginationItem({ ...props }: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

export type PaginationLinkProps = ComponentProps<"a"> & {
  isActive?: boolean;
  size?: "default" | "sm" | "icon";
};

export function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      data-slot="pagination-link"
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        "cursor-pointer",
        className,
      )}
      aria-current={isActive ? "page" : undefined}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      size="default"
      className={cn("gap-1 ps-2.5", className)}
      aria-label="Trang trước"
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Trước</span>
    </PaginationLink>
  );
}

export function PaginationNext({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      size="default"
      className={cn("gap-1 pe-2.5", className)}
      aria-label="Trang sau"
      {...props}
    >
      <span>Sau</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      aria-label="Thêm trang"
      aria-hidden
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
    </span>
  );
}
