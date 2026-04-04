/**
 * Sparkline bar chart for embedding inside DashboardOverviewCardV3.
 *
 * Pattern: h-32 BarChart, hidden axes, no padding.
 * Adapted from Shadboard dashboard chart patterns.
 */

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SparklineBarChartProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  xKey?: string;
  config?: ChartConfig;
  color?: string;
  radius?: number;
  className?: string;
}

export function SparklineBarChart({
  data,
  dataKey,
  xKey = "label",
  config = {},
  color = "var(--chart-1)",
  radius = 4,
  className = "h-32 w-full",
}: SparklineBarChartProps) {
  const mergedConfig: ChartConfig = {
    [dataKey]: { label: dataKey, color },
    ...config,
  };

  return (
    <ChartContainer
      config={mergedConfig}
      className={`${className} overflow-hidden rounded-b-md`}
    >
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          hide
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={radius} />
      </BarChart>
    </ChartContainer>
  );
}
