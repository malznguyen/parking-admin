"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Activity } from "lucide-react";

interface HeroSectionProps {
  availableSpots: number;
  totalSpots: number;
  pendingExceptions: number;
  systemStatus?: "normal" | "warning" | "critical";
}

export function HeroSection({
  availableSpots,
  totalSpots,
  pendingExceptions,
  systemStatus = "normal",
}: HeroSectionProps) {
  const occupancyRate = ((totalSpots - availableSpots) / totalSpots) * 100;

  // Determine capacity status color
  const getCapacityColor = () => {
    if (occupancyRate >= 90) return "text-danger";
    if (occupancyRate >= 75) return "text-warning";
    return "text-primary";
  };

  const getProgressColor = () => {
    if (occupancyRate >= 90) return "bg-danger";
    if (occupancyRate >= 75) return "bg-warning";
    return "bg-primary";
  };

  const getStatusConfig = () => {
    if (systemStatus === "critical" || pendingExceptions > 10) {
      return {
        color: "bg-danger/10 border-danger/30",
        iconColor: "text-danger",
        label: "CẦN CHÚ Ý",
        Icon: AlertTriangle,
      };
    }
    if (systemStatus === "warning" || pendingExceptions > 5) {
      return {
        color: "bg-warning/10 border-warning/30",
        iconColor: "text-warning",
        label: "THEO DÕI",
        Icon: Activity,
      };
    }
    return {
      color: "bg-success/10 border-success/30",
      iconColor: "text-success",
      label: "BÌNH THƯỜNG",
      Icon: CheckCircle2,
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.Icon;

  return (
    <div className="relative overflow-hidden rounded-xl bg-card border-l-4 border-l-primary border border-border shadow-lg animate-fade-scale-in">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative p-5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Side - Capacity Display (60%) */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-industrial font-semibold mb-2">
              TRẠNG THÁI BÃI XE HIỆN TẠI
            </div>

            {/* Giant Number Display */}
            <div className="flex items-baseline gap-2 mb-3">
              <span
                className={cn(
                  "text-5xl lg:text-6xl font-bold font-data tracking-tight leading-none animate-count-up",
                  getCapacityColor()
                )}
              >
                {availableSpots}
              </span>
              <span className="text-2xl lg:text-3xl font-data text-muted-foreground/50">
                /{totalSpots}
              </span>
            </div>

            <div className="text-xs text-muted-foreground uppercase tracking-industrial font-medium mb-2">
              CHỖ TRỐNG
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xl">
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    getProgressColor()
                  )}
                  style={{
                    width: `${occupancyRate}%`,
                  }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="font-data font-semibold text-foreground">
                  {occupancyRate.toFixed(1)}% Đã sử dụng
                </span>
                <span className="text-muted-foreground">
                  {totalSpots - availableSpots} xe đang đỗ
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Status Panel (40%) */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            {/* System Status */}
            <div
              className={cn(
                "rounded-lg border p-4 mb-3",
                statusConfig.color
              )}
            >
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("h-6 w-6", statusConfig.iconColor)} />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-industrial">
                    TRẠNG THÁI
                  </div>
                  <div
                    className={cn(
                      "text-sm font-bold uppercase tracking-industrial",
                      statusConfig.iconColor
                    )}
                  >
                    {statusConfig.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Exception Alert */}
            {pendingExceptions > 0 && (
              <div
                className={cn(
                  "rounded-lg border p-3",
                  pendingExceptions > 5
                    ? "bg-danger/10 border-danger/30"
                    : "bg-warning/10 border-warning/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={cn(
                      "h-5 w-5",
                      pendingExceptions > 5 ? "text-danger" : "text-warning"
                    )}
                  />
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-lg font-bold font-data",
                          pendingExceptions > 5
                            ? "text-danger"
                            : "text-warning"
                        )}
                      >
                        {pendingExceptions}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Ngoại lệ chờ xử lý
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
