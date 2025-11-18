"use client";

import { cn } from "@/lib/utils";
import { mockSessions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function RecentSessions() {
  // Get 4 most recent sessions for better spacing
  const recentSessions = mockSessions
    .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
    .slice(0, 4);

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: "bg-success/20 text-success border-success/30",
      medium: "bg-warning/20 text-warning border-warning/30",
      low: "bg-danger/20 text-danger border-danger/30",
      failed: "bg-danger/20 text-danger border-danger/30",
    };
    return colors[confidence as keyof typeof colors] || colors.low;
  };

  const getPaymentBadge = (status: string) => {
    const colors = {
      paid: "bg-success/20 text-success border-success/30",
      unpaid: "bg-danger/20 text-danger border-danger/30",
      exempted: "bg-info/20 text-info border-info/30",
    };
    return colors[status as keyof typeof colors] || colors.unpaid;
  };

  return (
    <div className="rounded-2xl bg-card border border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-base uppercase tracking-wide text-foreground font-bold">
          Hoạt động gần đây
        </h3>
        <span className="text-sm text-muted-foreground font-body">
          {recentSessions.length} xe gần nhất
        </span>
      </div>

      <div className="divide-y divide-border/50">
        {recentSessions.map((session, index) => (
          <div
            key={session.id}
            className={cn(
              "flex items-center gap-4 px-6 py-5 transition-colors hover:bg-secondary/40",
              index % 2 === 0 ? "bg-transparent" : "bg-secondary/10"
            )}
          >
            {/* Direction Icon */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
                session.exitTime
                  ? "bg-danger/15 text-danger"
                  : "bg-success/15 text-success"
              )}
            >
              {session.exitTime ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
            </div>

            {/* License Plate */}
            <div className="flex-1 min-w-0">
              <div className="license-plate text-base text-foreground font-semibold font-mono">
                {session.licensePlate}
              </div>
            </div>

            {/* Gate */}
            <div className="text-sm text-muted-foreground font-body">
              Cổng {session.entryGate}
            </div>

            {/* Time */}
            <div className="text-sm font-data text-foreground tabular-nums font-semibold">
              {format(new Date(session.entryTime), "HH:mm")}
            </div>

            {/* Status */}
            <Badge
              variant="outline"
              className={cn(
                "text-xs uppercase tracking-wide h-6 px-3 flex-shrink-0 font-display font-semibold",
                session.exitTime ? "bg-danger/10 text-danger border-danger/30" : "bg-success/10 text-success border-success/30"
              )}
            >
              {session.exitTime ? "Đã ra" : "Đang đỗ"}
            </Badge>
          </div>
        ))}
      </div>

      {/* View All Footer */}
      <div className="px-6 py-4 border-t border-border bg-secondary/5">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 font-display">
          Xem tất cả hoạt động
          <span className="text-base">→</span>
        </button>
      </div>
    </div>
  );
}
