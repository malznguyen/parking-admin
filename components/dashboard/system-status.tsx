"use client";

import { cn } from "@/lib/utils";
import { generateSystemStatus } from "@/lib/mock-data";
import {
  Camera,
  Shield,
  Cpu,
  Database,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

const statusIcons = {
  operational: <CheckCircle2 className="h-4 w-4 text-success" />,
  healthy: <CheckCircle2 className="h-4 w-4 text-success" />,
  online: <CheckCircle2 className="h-4 w-4 text-success" />,
  degraded: <AlertCircle className="h-4 w-4 text-warning" />,
  slow: <AlertCircle className="h-4 w-4 text-warning" />,
  maintenance: <AlertCircle className="h-4 w-4 text-warning" />,
  offline: <XCircle className="h-4 w-4 text-danger" />,
  faulty: <XCircle className="h-4 w-4 text-danger" />,
  stuck_open: <XCircle className="h-4 w-4 text-danger" />,
  stuck_closed: <XCircle className="h-4 w-4 text-danger" />,
};

export function SystemStatus() {
  const status = generateSystemStatus();

  const getStatusIcon = (s: string) => {
    return statusIcons[s as keyof typeof statusIcons] || statusIcons.offline;
  };

  return (
    <div className="rounded-md bg-card border-brutal border-border p-4 shadow-brutal-sm animate-fade-scale-in">
      <h3 className="font-display text-sm uppercase tracking-industrial text-foreground mb-4">
        Trạng thái hệ thống
      </h3>

      {/* Gates Status */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-industrial">
          Cổng & Thiết bị
        </div>

        {status.gates.map((gate) => (
          <div
            key={gate.id}
            className="rounded bg-secondary/30 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Cổng {gate.id}
              </span>
              {getStatusIcon(gate.status)}
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1">
                <Camera className="h-3 w-3 text-muted-foreground" />
                <span
                  className={cn(
                    gate.camera.status === "operational"
                      ? "text-success"
                      : gate.camera.status === "degraded"
                      ? "text-warning"
                      : "text-danger"
                  )}
                >
                  {gate.camera.uptime.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span
                  className={cn(
                    gate.barrier.status === "operational"
                      ? "text-success"
                      : "text-danger"
                  )}
                >
                  {gate.barrier.status === "operational" ? "OK" : "ERR"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                <span
                  className={cn(
                    gate.loopSensor.status === "operational"
                      ? "text-success"
                      : "text-danger"
                  )}
                >
                  {gate.loopSensor.status === "operational" ? "OK" : "ERR"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Server Status */}
      <div className="mt-4 space-y-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-industrial">
          Máy chủ
        </div>

        <div className="space-y-2">
          {/* CPU */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">CPU</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    status.server.cpu > 80
                      ? "bg-danger"
                      : status.server.cpu > 60
                      ? "bg-warning"
                      : "bg-success"
                  )}
                  style={{ width: `${status.server.cpu}%` }}
                />
              </div>
              <span className="text-xs font-data text-foreground">
                {status.server.cpu}%
              </span>
            </div>
          </div>

          {/* Memory */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">RAM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    status.server.memory > 80
                      ? "bg-danger"
                      : status.server.memory > 60
                      ? "bg-warning"
                      : "bg-success"
                  )}
                  style={{ width: `${status.server.memory}%` }}
                />
              </div>
              <span className="text-xs font-data text-foreground">
                {status.server.memory}%
              </span>
            </div>
          </div>

          {/* Storage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">SSD</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    status.server.storage > 80
                      ? "bg-danger"
                      : status.server.storage > 60
                      ? "bg-warning"
                      : "bg-success"
                  )}
                  style={{ width: `${status.server.storage}%` }}
                />
              </div>
              <span className="text-xs font-data text-foreground">
                {status.server.storage}%
              </span>
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Uptime</span>
            <span className="text-xs font-data text-success">
              {status.server.uptime}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">DB Response</span>
            <span
              className={cn(
                "text-xs font-data",
                status.database.responseTime < 30
                  ? "text-success"
                  : status.database.responseTime < 50
                  ? "text-warning"
                  : "text-danger"
              )}
            >
              {status.database.responseTime}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
