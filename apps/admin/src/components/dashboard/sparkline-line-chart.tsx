/**
 * Sparkline line chart for embedding inside DashboardOverviewCardV3.
 *
 * Pattern: h-32 LineChart, hidden axes, no padding.
 * Adapted from Shadboard dashboard chart patterns.
 */

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SparklineLineChartProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  xKey?: string;
  config?: ChartConfig;
  color?: string;
  strokeWidth?: number;
  curveType?: "natural" | "monotone" | "step" | "linear";
  className?: string;
}

export function SparklineLineChart({
  data,
  dataKey,
  xKey = "label",
  config = {},
  color = "var(--chart-1)",
  strokeWidth = 2,
  curveType = "monotone",
  className = "h-32 w-full",
}: SparklineLineChartProps) {
  const mergedConfig: ChartConfig = {
    [dataKey]: { label: dataKey, color },
    ...config,
  };

  return (
    <ChartContainer
      config={mergedConfig}
      className={`${className} overflow-hidden rounded-b-md`}
    >
      <LineChart
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
        <Line
          dataKey={dataKey}
          type={curveType}
          stroke={`var(--color-${dataKey})`}
          strokeWidth={strokeWidth}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
