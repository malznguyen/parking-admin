"use client";

import { cn } from "@/lib/utils";
import { mockSessions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function RecentSessions() {
  // Get 8 most recent sessions
  const recentSessions = mockSessions
    .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
    .slice(0, 8);

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
    <div className="rounded-md bg-card border-brutal border-border shadow-brutal-sm animate-fade-scale-in overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-sm uppercase tracking-industrial text-foreground">
          Hoạt động gần đây
        </h3>
      </div>

      <div className="divide-y divide-border/50">
        {recentSessions.map((session, index) => (
          <div
            key={session.id}
            className={cn(
              "flex items-center gap-4 p-4 transition-colors hover:bg-secondary/30",
              index % 2 === 0 ? "bg-transparent" : "bg-secondary/10"
            )}
          >
            {/* Direction Icon */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md",
                session.exitTime
                  ? "bg-danger/10 text-danger"
                  : "bg-success/10 text-success"
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
              <div className="license-plate text-sm text-foreground">
                {session.licensePlate}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Cổng {session.entryGate}
              </div>
            </div>

            {/* Time */}
            <div className="text-right">
              <div className="text-xs font-data text-foreground">
                {format(new Date(session.entryTime), "HH:mm:ss")}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {format(new Date(session.entryTime), "dd/MM")}
              </div>
            </div>

            {/* Confidence */}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-industrial h-5 px-2",
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
                "text-[10px] uppercase tracking-industrial h-5 px-2 w-16 justify-center",
                getPaymentBadge(session.paymentStatus)
              )}
            >
              {session.paymentStatus === "paid"
                ? "Đã TT"
                : session.paymentStatus === "exempted"
                ? "Miễn phí"
                : "Chưa TT"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
