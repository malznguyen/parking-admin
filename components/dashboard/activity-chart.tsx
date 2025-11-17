"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "./chart-container";

// Generate 24-hour activity data
const generateHourlyData = () => {
  const data = [];
  const baseOccupancy = 150;

  for (let hour = 0; hour < 24; hour++) {
    let occupancy = baseOccupancy;
    let entries = 0;
    let exits = 0;

    // Simulate realistic patterns
    if (hour >= 7 && hour <= 9) {
      // Morning rush
      entries = Math.floor(Math.random() * 40 + 30);
      exits = Math.floor(Math.random() * 10 + 5);
      occupancy = baseOccupancy + (hour - 6) * 25;
    } else if (hour >= 11 && hour <= 13) {
      // Lunch time
      entries = Math.floor(Math.random() * 20 + 10);
      exits = Math.floor(Math.random() * 25 + 15);
      occupancy = 320 - (hour - 11) * 20;
    } else if (hour >= 16 && hour <= 18) {
      // Evening rush
      entries = Math.floor(Math.random() * 10 + 5);
      exits = Math.floor(Math.random() * 45 + 35);
      occupancy = 280 - (hour - 16) * 40;
    } else if (hour >= 5 && hour <= 7) {
      // Early morning
      entries = Math.floor(Math.random() * 15 + 5);
      exits = Math.floor(Math.random() * 5);
      occupancy = baseOccupancy + hour * 10;
    } else if (hour >= 19 || hour <= 4) {
      // Night time
      entries = Math.floor(Math.random() * 3);
      exits = Math.floor(Math.random() * 5);
      occupancy = Math.max(50, baseOccupancy - 80);
    } else {
      entries = Math.floor(Math.random() * 15 + 5);
      exits = Math.floor(Math.random() * 15 + 5);
      occupancy = 250 + Math.floor(Math.random() * 50);
    }

    data.push({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      occupancy: Math.min(500, Math.max(0, occupancy)),
      entries,
      exits,
    });
  }

  return data;
};

const data = generateHourlyData();

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border-brutal border-border p-3 shadow-brutal-lg">
        <p className="font-display text-xs uppercase tracking-industrial text-foreground mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-data font-semibold text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ActivityChart() {
  return (
    <ChartContainer
      title="Hoạt động 24 giờ"
      subtitle="Lưu lượng xe vào/ra và tỷ lệ lấp đầy"
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.78 0.18 172)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.78 0.18 172)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="entriesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.74 0.2 158)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.74 0.2 158)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.28 0.01 250)"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: "oklch(0.7 0 0)" }}
              tickLine={false}
              axisLine={{ stroke: "oklch(0.28 0.01 250)" }}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "oklch(0.7 0 0)" }}
              tickLine={false}
              axisLine={{ stroke: "oklch(0.28 0.01 250)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="occupancy"
              name="Lấp đầy"
              stroke="oklch(0.78 0.18 172)"
              strokeWidth={3}
              fill="url(#occupancyGradient)"
            />
            <Area
              type="monotone"
              dataKey="entries"
              name="Vào"
              stroke="oklch(0.74 0.2 158)"
              strokeWidth={2}
              fill="url(#entriesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
