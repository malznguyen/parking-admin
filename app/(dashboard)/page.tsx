"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/dashboard/hero-section";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import {
  getCurrentlyParkedSessions,
  mockExceptions,
  mockSessions,
  calculateRevenue,
} from "@/lib/mock-data";
import { PARKING_CONFIG } from "@/lib/constants";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
  const yesterdayRevenue = todayRevenue * 0.88; // Mock: today is 12% higher
  const revenueTrend = todayRevenue - yesterdayRevenue;
  const parkedTrend = Math.floor(Math.random() * 10 - 5) + 3; // Mock: ±5 variance

  // Manual refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl uppercase tracking-industrial text-foreground">
            Tổng quan
          </h1>
          <p className="text-xs text-muted-foreground">
            Trung tâm điều khiển bãi đỗ xe HaUI
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-industrial"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-industrial">
              Cập nhật lúc
            </div>
            <div className="font-data text-sm text-foreground tabular-nums">
              {currentTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Primary Zone */}
      <HeroSection
        availableSpots={availableSpots}
        totalSpots={PARKING_CONFIG.TOTAL_SPOTS}
        pendingExceptions={pendingExceptions.length}
        systemStatus={
          pendingExceptions.length > 10
            ? "critical"
            : pendingExceptions.length > 5
            ? "warning"
            : "normal"
        }
      />

      {/* Key Metrics - 2 Column Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Doanh thu hôm nay"
          value={formatCurrency(todayRevenue)}
          suffix="đ"
          trend={{
            value: formatCurrency(Math.abs(revenueTrend)),
            label: "so với hôm qua",
            direction: revenueTrend >= 0 ? "up" : "down",
            isPositive: revenueTrend >= 0,
          }}
          accentColor="success"
          animationDelay={200}
        />
        <MetricCard
          label="Xe đang đỗ"
          value={currentlyParked.length}
          suffix="xe"
          trend={{
            value: Math.abs(parkedTrend),
            label: "hôm nay",
            direction: parkedTrend >= 0 ? "up" : "down",
            isPositive: true, // More cars = more revenue
          }}
          accentColor="info"
          animationDelay={300}
        />
      </div>

      {/* Activity Chart Section - Secondary Zone */}
      <div className="animate-slide-in-up" style={{ animationDelay: "400ms" }}>
        <ActivityChart />
      </div>

      {/* Recent Sessions - Tertiary Zone */}
      <div className="animate-slide-in-up" style={{ animationDelay: "500ms" }}>
        <RecentSessions />
      </div>
    </div>
  );
}
