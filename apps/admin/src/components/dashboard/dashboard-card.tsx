/**
 * Dashboard card components for metric display.
 *
 * Three variants:
 * - DashboardCard: Generic card with title, period, action slot, and children
 * - DashboardOverviewCard: Stat card with value + percentage change badge
 * - DashboardOverviewCardWithChart: Stat card with embedded mini-chart
 *
 * Ported from Shadboard, adapted for PMTL admin:
 * - Removed Card asChild (admin Card doesn't use Slot)
 * - Vietnamese locale for number formatting
 * - Simplified icon type to LucideIcon
 * - Removed formatOverviewCardValue dependency (inline formatting)
 */

import { cva } from "class-variance-authority";
import { EllipsisVertical } from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PercentageChangeBadge } from "./percentage-change-badge";

export const cardContentVariants = cva(
  "flex flex-col justify-between gap-y-6",
  {
    variants: {
      size: {
        xs: "h-32",
        sm: "h-64",
        default: "h-96",
        lg: "h-[29rem]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type FormatStyle = "percent" | "currency" | "regular";

function formatCardValue(value: number, style: FormatStyle): string {
  switch (style) {
    case "percent":
      return new Intl.NumberFormat("vi-VN", {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(value);
    case "currency":
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value);
    default:
      return value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
  }
}

// --- DashboardCard (generic) ---

interface DashboardCardProps extends ComponentProps<"div"> {
  title: string;
  period?: string;
  action?: ReactNode;
  contentClassName?: string;
  size?: VariantProps<typeof cardContentVariants>["size"];
}

export function DashboardCard({
  title,
  period,
  action,
  children,
  contentClassName,
  size,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <Card className={className} {...props}>
      <div className="flex justify-between p-6">
        <div>
          <CardTitle>{title}</CardTitle>
          {period && <CardDescription>{period}</CardDescription>}
        </div>
        {action}
      </div>
      <CardContent
        className={cn(cardContentVariants({ size }), contentClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
}

// --- DashboardOverviewCard (stat + trend) ---

interface DashboardOverviewCardProps extends ComponentProps<"div"> {
  data: {
    value: number;
    percentageChange: number;
  };
  title: string;
  period?: string;
  action?: ReactNode;
  icon: LucideIcon;
  formatStyle?: FormatStyle;
  contentClassName?: string;
}

export function DashboardOverviewCard({
  data,
  title,
  period,
  action,
  icon: Icon,
  formatStyle = "regular",
  className,
  contentClassName,
  ...props
}: DashboardOverviewCardProps) {
  const value = formatCardValue(data.value, formatStyle);

  return (
    <Card
      className={cn("flex flex-col justify-between", className)}
      {...props}
    >
      <div className="flex justify-between p-6">
        <div>
          <CardTitle className="inline-flex gap-x-1">
            <Icon className="size-4" aria-hidden />
            <span>{title}</span>
          </CardTitle>
          {period && <CardDescription>{period}</CardDescription>}
        </div>
        {action}
      </div>
      <CardContent className={cn("space-y-1", contentClassName)}>
        <p className="text-2xl font-semibold break-all">{value}</p>
        <PercentageChangeBadge value={data.percentageChange} />
      </CardContent>
    </Card>
  );
}

// --- DashboardOverviewCard V2 (icon badge + period) ---

interface DashboardOverviewCardV2Props extends ComponentProps<"div"> {
  data: {
    value: number;
    percentageChange: number;
  };
  title: string;
  period: string;
  action?: ReactNode;
  icon: LucideIcon;
  iconColor?: string;
  formatStyle?: FormatStyle;
  contentClassName?: string;
}

export function DashboardOverviewCardV2({
  data,
  title,
  period,
  action,
  icon: Icon,
  iconColor = "var(--primary)",
  formatStyle = "regular",
  className,
  contentClassName,
  ...props
}: DashboardOverviewCardV2Props) {
  const value = formatCardValue(data.value, formatStyle);

  return (
    <Card
      className={cn("flex flex-col justify-between", className)}
      {...props}
    >
      <div className="flex justify-between p-6">
        <div className="flex items-center gap-x-2">
          <Badge
            style={{ backgroundColor: iconColor }}
            className="size-12 aspect-square"
            aria-hidden
          >
            <Icon className="size-full" />
          </Badge>
          <div>
            <CardDescription>{period}</CardDescription>
            <PercentageChangeBadge
              variant="ghost"
              value={data.percentageChange}
              className="p-0"
            />
          </div>
        </div>
        {action}
      </div>
      <CardContent className={cn("space-y-1", contentClassName)}>
        <CardTitle className="text-muted-foreground font-normal">
          {title}
        </CardTitle>
        <p className="text-2xl font-semibold break-all">{value}</p>
      </CardContent>
    </Card>
  );
}

// --- DashboardOverviewCard V3 (stat + embedded chart) ---

interface DashboardOverviewCardV3Props extends ComponentProps<"div"> {
  data: {
    value: number;
    percentageChange: number;
  };
  title: string;
  action?: ReactNode;
  chart: ReactNode;
  formatStyle?: FormatStyle;
  contentClassName?: string;
}

export function DashboardOverviewCardV3({
  data,
  title,
  action,
  chart,
  formatStyle = "regular",
  contentClassName,
  className,
  ...props
}: DashboardOverviewCardV3Props) {
  const value = formatCardValue(data.value, formatStyle);

  return (
    <Card
      className={cn("flex flex-col justify-between", className)}
      {...props}
    >
      <div className="flex justify-between p-6 pb-3">
        <div>
          <CardTitle className="text-muted-foreground font-normal">
            {title}
          </CardTitle>
          <div className="inline-flex flex-wrap items-baseline gap-x-1">
            <p className="text-2xl font-semibold break-all">{value}</p>
            <PercentageChangeBadge
              variant="ghost"
              value={data.percentageChange}
              className="p-0"
            />
          </div>
        </div>
        {action}
      </div>
      <CardContent
        className={cn(
          "flex justify-center items-center p-0",
          contentClassName,
        )}
      >
        {chart}
      </CardContent>
    </Card>
  );
}

// --- Actions dropdown (reusable for any dashboard card) ---

export function DashboardCardActionsDropdown({
  children,
  ...props
}: ComponentProps<typeof DropdownMenu>) {
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger
        aria-label="Thao tác khác"
        className={cn(
          "-mt-2 -me-2",
          buttonVariants({ variant: "ghost", size: "icon" }),
        )}
      >
        <EllipsisVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}
