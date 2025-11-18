import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card border border-border p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] animate-fade-scale-in",
        className
      )}
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-display text-base uppercase tracking-wide text-foreground font-bold">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground font-body mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
