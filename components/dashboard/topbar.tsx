"use client";

import { Search, Bell, User, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  sidebarCollapsed?: boolean;
}

export function Topbar({ sidebarCollapsed = false }: TopbarProps) {
  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 ${
        sidebarCollapsed ? "left-[72px]" : "left-64"
      }`}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Breadcrumbs / Page Title */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Dashboard
          </span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-sm font-semibold text-foreground">
            Tổng quan
          </span>
        </div>

        {/* Search Bar - Center */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm biển số, tên, MSSV..."
              className="h-10 w-full pl-10 pr-20 bg-secondary/50 border-border/50 focus:bg-secondary focus:border-primary/50 font-mono text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
              <kbd className="flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Bell className="h-4 w-4" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold animate-pulse-glow"
            >
              3
            </Badge>
          </Button>

          {/* User Profile */}
          <Button
            variant="ghost"
            className="h-9 gap-2 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-xs font-semibold text-foreground">
                Admin
              </span>
              <span className="text-[10px] text-muted-foreground">
                Bảo vệ A
              </span>
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}
