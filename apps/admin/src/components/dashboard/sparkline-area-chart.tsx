/**
 * Sparkline area chart for embedding inside DashboardOverviewCardV3.
 *
 * Pattern: h-32 AreaChart, hidden axes, no padding, rounded-b overflow.
 * Adapted from Shadboard analytics overview charts.
 */

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SparklineAreaChartProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  xKey?: string;
  config?: ChartConfig;
  color?: string;
  fillOpacity?: number;
  curveType?: "natural" | "monotone" | "step" | "linear";
  className?: string;
}

export function SparklineAreaChart({
  data,
  dataKey,
  xKey = "label",
  config = {},
  color = "var(--chart-1)",
  fillOpacity = 0.4,
  curveType = "natural",
  className = "h-32 w-full",
}: SparklineAreaChartProps) {
  const mergedConfig: ChartConfig = {
    [dataKey]: { label: dataKey, color },
    ...config,
  };

  return (
    <ChartContainer
      config={mergedConfig}
      className={`${className} overflow-hidden rounded-b-md`}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
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
        <Area
          dataKey={dataKey}
          type={curveType}
          fill={`var(--color-${dataKey})`}
          fillOpacity={fillOpacity}
          stroke={`var(--color-${dataKey})`}
        />
      </AreaChart>
    </ChartContainer>
  );
}
