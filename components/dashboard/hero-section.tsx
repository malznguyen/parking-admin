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
    <div className="relative overflow-hidden rounded-2xl bg-card border-l-[6px] border-l-primary border border-border shadow-[0_4px_12px_rgba(0,0,0,0.08)] animate-fade-scale-in min-h-[280px]">
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

      <div className="relative p-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left Side - Capacity Display (60%) */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-display font-semibold mb-4">
              TRẠNG THÁI BÃI XE HIỆN TẠI
            </div>

            {/* Giant Number Display */}
            <div className="flex items-baseline gap-3 mb-6">
              <span
                className={cn(
                  "text-8xl lg:text-[120px] font-extrabold font-display tracking-tight leading-none animate-count-up",
                  getCapacityColor()
                )}
              >
                {availableSpots}
              </span>
              <span className="text-5xl lg:text-6xl font-display font-bold text-muted-foreground/50">
                /{totalSpots}
              </span>
            </div>

            <div className="text-sm text-muted-foreground uppercase tracking-wider font-display font-semibold mb-4">
              Chỗ trống
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl">
              <div className="h-6 w-full rounded-full bg-muted overflow-hidden shadow-inner">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r",
                    occupancyRate >= 90 ? "from-danger via-danger/90 to-danger" :
                    occupancyRate >= 75 ? "from-warning via-warning/90 to-warning" :
                    "from-primary via-cyan-500 to-primary"
                  )}
                  style={{
                    width: `${occupancyRate}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-base">
                <span className="font-data font-semibold text-foreground">
                  {occupancyRate.toFixed(1)}% Đã sử dụng
                </span>
                <span className="font-body text-muted-foreground">
                  {totalSpots - availableSpots} xe đang đỗ
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Status Panel (40%) */}
          <div className="lg:col-span-2 flex flex-col justify-center gap-6">
            {/* System Status */}
            <div
              className={cn(
                "rounded-2xl border-2 p-5 h-14 flex items-center",
                statusConfig.color
              )}
            >
              <div className="flex items-center gap-3">
                <StatusIcon className={cn("h-7 w-7", statusConfig.iconColor)} />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-display font-semibold">
                    Tình trạng
                  </div>
                  <div
                    className={cn(
                      "text-base font-bold uppercase tracking-wide font-display",
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
                  "rounded-xl border-2 p-5",
                  pendingExceptions > 5
                    ? "bg-[#FEE2E2] border-danger/50"
                    : "bg-[#FEF3C7] border-warning/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    className={cn(
                      "h-6 w-6",
                      pendingExceptions > 5 ? "text-danger" : "text-warning"
                    )}
                  />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "text-2xl font-bold font-data",
                          pendingExceptions > 5
                            ? "text-danger"
                            : "text-warning"
                        )}
                      >
                        {pendingExceptions}
                      </span>
                      <span className="text-sm text-foreground/80 font-body">
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
