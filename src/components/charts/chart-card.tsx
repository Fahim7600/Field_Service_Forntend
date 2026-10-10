import type * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export function ChartSkeleton({
  height = 280,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full flex flex-col justify-end p-4 gap-3 rounded-lg bg-muted/20 animate-pulse border border-border/40",
        className,
      )}
      style={{ height }}
    >
      <div className="flex items-end justify-between gap-3 h-full pt-4">
        <Skeleton className="w-1/6 h-3/5 rounded-t" />
        <Skeleton className="w-1/6 h-4/5 rounded-t" />
        <Skeleton className="w-1/6 h-2/5 rounded-t" />
        <Skeleton className="w-1/6 h-5/6 rounded-t" />
        <Skeleton className="w-1/6 h-1/2 rounded-t" />
        <Skeleton className="w-1/6 h-3/4 rounded-t" />
      </div>
      <div className="flex justify-between gap-2 pt-2 border-t border-border/40">
        <Skeleton className="w-10 h-3" />
        <Skeleton className="w-10 h-3" />
        <Skeleton className="w-10 h-3" />
        <Skeleton className="w-10 h-3" />
        <Skeleton className="w-10 h-3" />
        <Skeleton className="w-10 h-3" />
      </div>
    </div>
  );
}

export function ChartCard({
  title,
  description,
  children,
  footer,
  className,
  headerAction,
  icon: Icon,
}: ChartCardProps) {
  return (
    <Card
      className={cn(
        "border-border bg-card shadow-xs overflow-hidden flex flex-col",
        className,
      )}
    >
      <CardHeader className="pb-3 border-b border-border/50 bg-panel/30">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground font-heading">
              {Icon && <Icon className="size-4 text-primary shrink-0" />}
              <span>{title}</span>
            </CardTitle>
            {description && (
              <CardDescription className="text-xs text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-5 flex-1 min-w-0">{children}</CardContent>
      {footer && (
        <CardFooter className="p-3 px-4 border-t border-border/50 bg-muted/15 text-xs text-muted-foreground">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
