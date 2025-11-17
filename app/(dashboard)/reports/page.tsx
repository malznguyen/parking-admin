"use client";

import { useState, useMemo } from "react";
import { mockSessions, mockVehicles } from "@/lib/mock-data";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileSpreadsheet,
  FileText,
  Table as TableIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
} from "recharts";

type DateRange = "today" | "7days" | "30days" | "custom";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Generate mock revenue data for 30 days
  const revenueData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        revenue: Math.floor(250000 + Math.random() * 150000),
        vehicles: Math.floor(120 + Math.random() * 80),
      });
    }
    return data;
  }, []);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalVehicles = revenueData.reduce((sum, d) => sum + d.vehicles, 0);
    const avgDaily = totalRevenue / revenueData.length;

    return {
      totalRevenue,
      totalVehicles,
      avgDaily,
      revenueChange: 15.2,
      vehicleChange: 8.3,
      avgChange: 12.1,
    };
  }, [revenueData]);

  // Vehicle distribution data
  const vehicleDistribution = [
    { name: "Đăng ký", value: 70, color: "#00B894" },
    { name: "Vãng lai", value: 30, color: "#F59E0B" },
  ];

  // Gate usage data
  const gateUsage = [
    { gate: "Cổng A", percentage: 35 },
    { gate: "Cổng B", percentage: 28 },
    { gate: "Cổng C", percentage: 22 },
    { gate: "Cổng D", percentage: 15 },
  ];

  // Top vehicles data
  const topVehicles = useMemo(() => {
    return mockVehicles.slice(0, 10).map((v, i) => ({
      rank: i + 1,
      plate: v.licensePlate,
      owner: v.ownerName,
      entries: 42 - i * 3 + Math.floor(Math.random() * 5),
      avgDuration: (3.2 + i * 0.3).toFixed(1),
    }));
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  return (
    <div className="space-y-6 animate-fade-scale-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight text-foreground">
            Báo cáo & Thống kê
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Phân tích dữ liệu và xu hướng bãi xe
          </p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button>
          {showExportMenu && (
            <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-lg border border-border shadow-brutal-lg animate-fade-scale-in">
              <div className="py-1">
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[#F8FAFB] transition-colors">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel (.xlsx)
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[#F8FAFB] transition-colors">
                  <FileText className="h-4 w-4" />
                  PDF
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[#F8FAFB] transition-colors">
                  <TableIcon className="h-4 w-4" />
                  CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-2 w-fit">
        {[
          { key: "today", label: "Hôm nay" },
          { key: "7days", label: "7 ngày" },
          { key: "30days", label: "30 ngày" },
          { key: "custom", label: "Tùy chỉnh" },
        ].map((range) => (
          <button
            key={range.key}
            onClick={() => setDateRange(range.key as DateRange)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateRange === range.key
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-[#F8FAFB]"
            }`}
          >
            {range.key === "custom" && <Calendar className="h-4 w-4 inline mr-1" />}
            {range.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tổng doanh thu 30 ngày
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-foreground">
            {formatCurrency(summaryStats.totalRevenue)} đ
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-[#10B981]">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">+{summaryStats.revenueChange}%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Lượt đỗ xe
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-foreground">
            {formatCurrency(summaryStats.totalVehicles)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-[#10B981]">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">+{summaryStats.vehicleChange}%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Doanh thu TB/ngày
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-foreground">
            {formatCurrency(Math.round(summaryStats.avgDaily))} đ
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-[#10B981]">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">+{summaryStats.avgChange}%</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
        <div className="text-lg font-bold uppercase tracking-tight text-foreground mb-6">
          Biểu đồ doanh thu 30 ngày
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#64748B" }}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: "#64748B" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: "#64748B" }}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number, name: string) => [
                  name === "revenue"
                    ? `${formatCurrency(value)} đ`
                    : value,
                  name === "revenue" ? "Doanh thu" : "Số xe",
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === "revenue" ? "Doanh thu" : "Số xe"
                }
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                fill="#00B894"
                fillOpacity={0.1}
                stroke="#00B894"
                strokeWidth={3}
              />
              <Bar
                yAxisId="right"
                dataKey="vehicles"
                fill="#0EA5E9"
                fillOpacity={0.8}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Distribution */}
        <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
          <div className="text-lg font-bold uppercase tracking-tight text-foreground mb-6">
            Phân bố loại xe
          </div>
          <div className="h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, ""]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {vehicleDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gate Usage */}
        <div className="bg-white rounded-lg border border-border shadow-brutal-sm p-6">
          <div className="text-lg font-bold uppercase tracking-tight text-foreground mb-6">
            Tỷ lệ sử dụng các cổng
          </div>
          <div className="space-y-4">
            {gateUsage.map((gate) => (
              <div key={gate.gate} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {gate.gate}
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {gate.percentage}%
                  </span>
                </div>
                <div className="h-10 bg-[#E0F7F4] rounded-md overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-[#10B981] rounded-md transition-all duration-500"
                    style={{ width: `${gate.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Vehicles Table */}
      <div className="bg-white rounded-lg border border-border shadow-brutal-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="text-lg font-bold uppercase tracking-tight text-foreground">
            Top 10 xe vào/ra nhiều nhất
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFB] border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#475569]">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Biển số
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Chủ xe
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Số lần
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Giờ TB
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {topVehicles.map((vehicle) => (
                <tr
                  key={vehicle.rank}
                  className="hover:bg-[#F8FAFB] transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-foreground">
                      {vehicle.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="license-plate text-sm bg-[#FEF3C7] px-2 py-1 rounded">
                      {vehicle.plate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {vehicle.owner}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-bold text-primary">
                      {vehicle.entries}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-muted-foreground">
                      {vehicle.avgDuration}h
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
}
