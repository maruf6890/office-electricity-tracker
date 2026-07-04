"use client";

import React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface HistoryEntry {
  timestamp: string;
  total_power: number;
  drawing_room: number;
  work1: number;
  work2: number;
}

const chartConfig = {
  total_power: {
    label: "Total",
    color: "#6366F1", 
  },
  drawing_room: {
    label: "Drawing Room",
    color: "#F59E0B",
  },
  work1: {
    label: "Work 1",
    color: "#10B981", 
  },
  work2: {
    label: "Work 2",
    color: "#EF4444", 
  },
} satisfies ChartConfig;
export default function HistoryChart({ history }: { history: HistoryEntry[] }) {
  const chartData = history.map((entry) => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    total_power: entry.total_power,
    drawing_room: entry.drawing_room,
    work1: entry.work1,
    work2: entry.work2,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          unit=" W"
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="total_power"
          type="monotone"
          stroke="var(--color-total_power)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="drawing_room"
          type="monotone"
          stroke="var(--color-drawing_room)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="work1"
          type="monotone"
          stroke="var(--color-work1)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="work2"
          type="monotone"
          stroke="var(--color-work2)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
