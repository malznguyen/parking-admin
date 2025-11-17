import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { SystemStatus } from "@/components/dashboard/system-status";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import {
  getCurrentlyParkedSessions,
  mockExceptions,
  mockSessions,
  calculateRevenue,
} from "@/lib/mock-data";
import { PARKING_CONFIG } from "@/lib/constants";
import { ParkingCircle, Car, Banknote, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  // Calculate real-time stats from mock data
  const currentlyParked = getCurrentlyParkedSessions();
  const availableSpots = PARKING_CONFIG.TOTAL_SPOTS - currentlyParked.length;

  // Today's sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySessions = mockSessions.filter(
    (s) => new Date(s.entryTime) >= today
  );

  // Today's revenue
  const todayRevenue = calculateRevenue(todaySessions);

  // Pending exceptions
  const pendingExceptions = mockExceptions.filter(
    (e) => e.status === "pending"
  );

  // Calculate trends (mock comparison with yesterday)
  const yesterdayParked = currentlyParked.length - Math.floor(Math.random() * 20 - 10);
  const parkedTrend = currentlyParked.length - yesterdayParked;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-industrial text-foreground">
            Tổng quan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Giám sát thời gian thực bãi đỗ xe HaUI
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-industrial">
            Cập nhật lúc
          </div>
          <div className="font-data text-sm text-foreground">
            {new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-in-up stagger-1">
          <StatCard
            label="Số chỗ trống"
            value={availableSpots}
            subValue={`/${PARKING_CONFIG.TOTAL_SPOTS}`}
            trend={{
              value: Math.abs(parkedTrend),
              label: "so với hôm qua",
              direction: parkedTrend > 0 ? "down" : "up",
            }}
            icon={ParkingCircle}
            accentColor="primary"
          />
        </div>
        <div className="animate-slide-in-up stagger-2">
          <StatCard
            label="Xe đang đỗ"
            value={currentlyParked.length}
            trend={{
              value: Math.abs(parkedTrend),
              label: "hôm nay",
              direction: parkedTrend > 0 ? "up" : "down",
            }}
            icon={Car}
            accentColor="info"
          />
        </div>
        <div className="animate-slide-in-up stagger-3">
          <StatCard
            label="Doanh thu hôm nay"
            value={new Intl.NumberFormat("vi-VN").format(todayRevenue)}
            subValue="₫"
            trend={{
              value: Math.floor(todayRevenue * 0.12),
              label: "so với hôm qua",
              direction: "up",
            }}
            icon={Banknote}
            accentColor="warning"
          />
        </div>
        <div className="animate-slide-in-up stagger-4">
          <StatCard
            label="Lỗi LPR chờ xử lý"
            value={pendingExceptions.length}
            trend={{
              value: pendingExceptions.filter((e) => e.priority === "urgent")
                .length,
              label: "khẩn cấp",
              direction: "up",
            }}
            icon={AlertTriangle}
            accentColor="danger"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column - Charts and Activity */}
        <div className="lg:col-span-8 space-y-6">
          <ActivityChart />
          <RecentSessions />
        </div>

        {/* Right Column - System Status */}
        <div className="lg:col-span-4">
          <SystemStatus />
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md bg-card border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-industrial">
              Tỷ lệ lấp đầy
            </span>
            <span className="font-data text-lg font-bold text-primary">
              {Math.round(
                (currentlyParked.length / PARKING_CONFIG.TOTAL_SPOTS) * 100
              )}
              %
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${
                  (currentlyParked.length / PARKING_CONFIG.TOTAL_SPOTS) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-md bg-card border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-industrial">
              Xe vào hôm nay
            </span>
            <span className="font-data text-lg font-bold text-success">
              {todaySessions.length}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Trung bình:{" "}
            <span className="font-data text-foreground">
              {Math.floor(todaySessions.length / (new Date().getHours() || 1))}
            </span>{" "}
            xe/giờ
          </div>
        </div>

        <div className="rounded-md bg-card border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-industrial">
              Độ chính xác LPR
            </span>
            <span className="font-data text-lg font-bold text-success">
              {(
                (todaySessions.filter((s) => s.entryConfidence === "high")
                  .length /
                  todaySessions.length) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Cao:{" "}
            <span className="font-data text-success">
              {todaySessions.filter((s) => s.entryConfidence === "high").length}
            </span>{" "}
            | Trung bình:{" "}
            <span className="font-data text-warning">
              {todaySessions.filter((s) => s.entryConfidence === "medium").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
