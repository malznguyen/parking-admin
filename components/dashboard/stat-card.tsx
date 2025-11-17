import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down";
  };
  icon: LucideIcon;
  accentColor: "primary" | "info" | "warning" | "danger";
  className?: string;
}

const accentColors = {
  primary: {
    border: "border-primary",
    icon: "text-primary",
    iconBg: "bg-primary/10",
    glow: "hover:shadow-glow-primary",
  },
  info: {
    border: "border-info",
    icon: "text-info",
    iconBg: "bg-info/10",
    glow: "hover:shadow-[0_0_24px_oklch(0.7_0.2_240_/_0.3)]",
  },
  warning: {
    border: "border-warning",
    icon: "text-warning",
    iconBg: "bg-warning/10",
    glow: "hover:shadow-glow-warning",
  },
  danger: {
    border: "border-danger",
    icon: "text-danger",
    iconBg: "bg-danger/10",
    glow: "hover:shadow-glow-danger",
  },
};

export function StatCard({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  accentColor,
  className,
}: StatCardProps) {
  const colors = accentColors[accentColor];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-card border-brutal p-6 transition-all duration-300 hover:-translate-y-0.5 shadow-brutal",
        colors.border,
        colors.glow,
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative flex flex-col h-full min-h-[120px]">
        {/* Label */}
        <span className="stat-label mb-3">{label}</span>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="stat-number animate-count-up">{value}</span>
          {subValue && (
            <span className="text-2xl font-medium text-muted-foreground font-data">
              {subValue}
            </span>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1.5 mt-auto">
            <span
              className={cn(
                "text-sm font-semibold font-data",
                trend.direction === "up" ? "text-success" : "text-danger"
              )}
            >
              {trend.direction === "up" ? "▲" : "▼"} {Math.abs(trend.value)}
            </span>
            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}

        {/* Icon */}
        <div
          className={cn(
            "absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-md",
            colors.iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", colors.icon)} />
        </div>
      </div>
    </div>
  );
}
