"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: {
    value: number | string;
    label: string;
    direction: "up" | "down" | "neutral";
    isPositive?: boolean;
  };
  accentColor?: "primary" | "success" | "warning" | "info" | "danger";
  className?: string;
  animationDelay?: number;
}

const accentColors = {
  primary: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
  info: "border-l-info",
  danger: "border-l-danger",
};

export function MetricCard({
  label,
  value,
  suffix,
  trend,
  accentColor = "primary",
  className,
  animationDelay = 0,
}: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.isPositive !== undefined) {
      return trend.isPositive ? "text-success" : "text-danger";
    }
    return trend.direction === "up" ? "text-success" : "text-danger";
  };

  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-card border border-border border-l-4 shadow-md p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-slide-in-up",
        accentColors[accentColor],
        className
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Label */}
      <div className="text-xs text-muted-foreground uppercase tracking-industrial font-semibold mb-4">
        {label}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-4xl lg:text-5xl font-bold font-data text-foreground tracking-tight animate-count-up">
          {value}
        </span>
        {suffix && (
          <span className="text-lg lg:text-xl font-data text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-2">
          <div className={cn("flex items-center gap-1", getTrendColor())}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-semibold font-data">
              {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
              {trend.value}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
