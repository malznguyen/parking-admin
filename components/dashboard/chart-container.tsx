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
        "rounded-md bg-card border-brutal border-border p-6 shadow-brutal-sm animate-fade-scale-in",
        className
      )}
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg uppercase tracking-industrial text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
