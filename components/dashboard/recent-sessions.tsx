"use client";

import { cn } from "@/lib/utils";
import { mockSessions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function RecentSessions() {
  // Get 5 most recent sessions for compact view
  const recentSessions = mockSessions
    .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
    .slice(0, 5);

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
    <div className="rounded-lg bg-card border border-border shadow-md overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-industrial text-foreground">
          Xe gần đây
        </h3>
        <span className="text-xs text-muted-foreground">
          {recentSessions.length} xe gần nhất
        </span>
      </div>

      <div className="divide-y divide-border/50">
        {recentSessions.map((session, index) => (
          <div
            key={session.id}
            className={cn(
              "flex items-center gap-3 px-4 h-12 transition-colors hover:bg-secondary/30",
              index % 2 === 0 ? "bg-transparent" : "bg-secondary/5"
            )}
          >
            {/* Direction Icon */}
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0",
                session.exitTime
                  ? "bg-danger/10 text-danger"
                  : "bg-success/10 text-success"
              )}
            >
              {session.exitTime ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownLeft className="h-3.5 w-3.5" />
              )}
            </div>

            {/* License Plate */}
            <div className="flex-1 min-w-0">
              <div className="license-plate text-sm text-foreground font-medium">
                {session.licensePlate}
              </div>
            </div>

            {/* Gate */}
            <div className="text-xs text-muted-foreground">
              Cổng {session.entryGate}
            </div>

            {/* Time */}
            <div className="text-xs font-data text-foreground tabular-nums">
              {format(new Date(session.entryTime), "HH:mm")}
            </div>

            {/* Confidence */}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-industrial h-5 px-2 flex-shrink-0",
                getConfidenceBadge(session.entryConfidence)
              )}
            >
              {session.entryConfidence === "high"
                ? "95%"
                : session.entryConfidence === "medium"
                ? "80%"
                : session.entryConfidence === "low"
                ? "60%"
                : "0%"}
            </Badge>

            {/* Payment Status */}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-industrial h-5 px-2 w-14 justify-center flex-shrink-0",
                getPaymentBadge(session.paymentStatus)
              )}
            >
              {session.paymentStatus === "paid"
                ? "Đã TT"
                : session.paymentStatus === "exempted"
                ? "Miễn"
                : "Chưa"}
            </Badge>
          </div>
        ))}
      </div>

      {/* View All Footer */}
      <div className="p-3 border-t border-border bg-secondary/5">
        <button className="w-full text-xs text-primary hover:text-primary/80 font-semibold uppercase tracking-industrial transition-colors flex items-center justify-center gap-1">
          Xem tất cả
          <span className="text-[10px]">→</span>
        </button>
      </div>
    </div>
  );
}
