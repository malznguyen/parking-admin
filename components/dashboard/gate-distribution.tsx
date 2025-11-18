"use client";

import { cn } from "@/lib/utils";
import { mockSessions } from "@/lib/mock-data";

export function GateDistribution() {
  // Calculate gate distribution from mock sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySessions = mockSessions.filter(
    (s) => new Date(s.entryTime) >= today
  );

  const gateStats = todaySessions.reduce((acc, session) => {
    const gate = session.entryGate;
    acc[gate] = (acc[gate] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSessions = todaySessions.length;

  const gates = [
    { id: "A", count: gateStats["A"] || 0, color: "bg-primary" },
    { id: "B", count: gateStats["B"] || 0, color: "bg-info" },
    { id: "C", count: gateStats["C"] || 0, color: "bg-success" },
    { id: "D", count: gateStats["D"] || 0, color: "bg-warning" },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-base uppercase tracking-wide text-foreground font-bold">
          Phân bổ theo cổng
        </h3>
        <span className="text-sm text-muted-foreground font-body">
          Hôm nay
        </span>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">
        {gates.map((gate) => {
          const percentage = totalSessions > 0 ? (gate.count / totalSessions) * 100 : 0;

          return (
            <div key={gate.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold font-display text-foreground">
                  Cổng {gate.id}
                </span>
                <span className="text-base font-mono font-semibold text-foreground tabular-nums">
                  {percentage.toFixed(0)}%
                </span>
              </div>

              <div className="h-4 w-full rounded-full bg-muted overflow-hidden shadow-inner">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    gate.color
                  )}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <div className="text-sm text-muted-foreground font-body">
                {gate.count} lượt
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground font-body">
            Tổng: <span className="font-semibold text-foreground font-mono">{totalSessions}</span> lượt hôm nay
          </div>
        </div>
      </div>

      {/* View All Footer */}
      <div className="px-6 py-4 border-t border-border bg-secondary/5">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 font-display">
          Xem báo cáo chi tiết
          <span className="text-base">→</span>
        </button>
      </div>
    </div>
  );
}
