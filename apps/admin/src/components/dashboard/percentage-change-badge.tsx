/**
 * Percentage change badge — shows trend direction with color coding.
 * Green + TrendingUp for positive, Red + TrendingDown for negative.
 *
 * Ported from Shadboard, adapted for PMTL admin:
 * - Uses PMTL semantic colors (success/destructive via CSS vars)
 * - Vietnamese locale for percentage formatting
 */

import { cva } from "class-variance-authority";
import { TrendingDown, TrendingUp } from "lucide-react";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const percentageChangeBadgeVariants = cva("gap-0", {
  variants: {
    variant: {
      default:
        "data-[non-negative-change=true]:bg-success data-[non-negative-change=false]:bg-destructive",
      ghost:
        "bg-transparent text-sm text-foreground data-[non-negative-change=true]:text-success data-[non-negative-change=false]:text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface PercentageChangeBadgeProps
  extends Omit<ComponentProps<typeof Badge>, "variant">,
    VariantProps<typeof percentageChangeBadgeVariants> {
  value: number;
}

export function PercentageChangeBadge({
  value,
  className,
  variant,
  ...props
}: PercentageChangeBadgeProps) {
  const isNonNegative = value >= 0;

  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <Badge
      className={cn(percentageChangeBadgeVariants({ variant }), className)}
      data-non-negative-change={isNonNegative}
      variant="destructive"
      {...props}
    >
      {isNonNegative && <span>+</span>}
      <span>{formatted}</span>
      <span className="ms-1" aria-hidden>
        {isNonNegative ? (
          <TrendingUp className="size-4" />
        ) : (
          <TrendingDown className="size-4" />
        )}
      </span>
    </Badge>
  );
}
