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
        "relative overflow-hidden rounded-2xl bg-card border border-border border-t-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] animate-slide-in-up h-[200px] flex flex-col justify-between",
        accentColors[accentColor].replace('border-l-', 'border-t-'),
        className
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Label */}
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-display font-semibold">
        {label}
      </div>

      {/* Value */}
      <div className="flex-1 flex items-center">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl lg:text-[56px] font-bold font-mono text-foreground tracking-tight leading-none animate-count-up">
            {value}
          </span>
          {suffix && (
            <span className="text-xl lg:text-2xl font-mono text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-2">
          <div className={cn("flex items-center gap-1", getTrendColor())}>
            <TrendIcon className="h-5 w-5" />
            <span className="text-base font-semibold font-data">
              {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
              {trend.value}
            </span>
          </div>
          <span className="text-sm text-muted-foreground font-body">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
