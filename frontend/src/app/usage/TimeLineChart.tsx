"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TimelinePoint {
  time: string;
  power: number;
}

const chartConfig = {
  power: {
    label: "Power",
    color: "#F59E0B",
  },
} satisfies ChartConfig;

export default function TimelineChart({ data }: { data: TimelinePoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="fillPower" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-power)"
              stopOpacity={0.3}
            />
            <stop offset="95%" stopColor="var(--color-power)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          unit=" W"
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          dataKey="power"
          type="monotone"
          stroke="var(--color-power)"
          fill="url(#fillPower)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
