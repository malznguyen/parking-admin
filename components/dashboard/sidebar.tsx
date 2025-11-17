"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ParkingCircle,
} from "lucide-react";

const navigation = [
  {
    name: "Tổng quan",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Quản lý xe",
    href: "/vehicles",
    icon: Car,
  },
  {
    name: "Xử lý ngoại lệ",
    href: "/exceptions",
    icon: AlertTriangle,
  },
  {
    name: "Đăng ký",
    href: "/registrations",
    icon: ClipboardList,
  },
  {
    name: "Báo cáo",
    href: "/reports",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out animate-slide-in-left",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="flex h-20 items-center border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ParkingCircle className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display text-lg tracking-tight text-sidebar-foreground">
                  HaUI
                </span>
                <span className="text-xs font-medium text-sidebar-foreground/60 tracking-industrial">
                  SMART PARKING
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-brutal border-l-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                  )}
                />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings Link */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <Link
            href="/settings"
            className="group flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200"
          >
            <Settings className="h-5 w-5 flex-shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors" />
            {!collapsed && <span>Cài đặt</span>}
          </Link>
        </div>

        {/* Collapse Button */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-md bg-sidebar-accent/50 p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
