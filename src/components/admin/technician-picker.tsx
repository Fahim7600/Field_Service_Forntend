"use client";

import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AvailableTechnician } from "@/types/work-order";

interface TechnicianPickerProps {
  technicians: AvailableTechnician[];
  selectedId?: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
  error?: unknown;
  onRetry?: () => void;
  disabled?: boolean;
  isWindowSelected?: boolean;
}

export function TechnicianPicker({
  technicians,
  selectedId,
  onSelect,
  isLoading,
  error,
  onRetry,
  disabled = false,
  isWindowSelected = true,
}: TechnicianPickerProps) {
  if (!isWindowSelected) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-1.5 py-6">
        <Users className="size-6 text-muted-foreground mx-auto" />
        <p className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200">
          Set a visit window to view available technicians
        </p>
        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
          Choose a valid start and end time above. The system will search for
          technicians qualified for this service who have no conflicting jobs.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
              key={i}
              className="h-20 w-full rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-2">
        <AlertCircle className="size-5 text-destructive mx-auto" />
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-destructive">
            Failed to look up available technicians
          </p>
          <p className="text-[11px] text-muted-foreground">
            {getErrorMessage(error)}
          </p>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-7 text-xs border-destructive/30 text-destructive gap-1.5"
          >
            <RefreshCw className="size-3" />
            <span>Retry Lookup</span>
          </Button>
        )}
      </div>
    );
  }

  if (technicians.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center space-y-1.5 py-6">
        <AlertCircle className="size-6 text-amber-600 dark:text-amber-400 mx-auto" />
        <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
          No available technicians found
        </p>
        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
          No active technicians with the required skill are free during this
          time. Try a different time window.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="technician-list-group"
          className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200 flex items-center gap-1.5"
        >
          <User className="size-3.5 text-primary" />
          <span>Select Free Technician ({technicians.length} available)</span>
          <span className="text-destructive">*</span>
        </label>
      </div>

      <div
        id="technician-list-group"
        role="radiogroup"
        aria-label="Select a field technician"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
      >
        {technicians.map((tech) => {
          const isSelected = selectedId === tech.id;
          const skillList = Array.isArray(tech.skills)
            ? tech.skills.map((s) => (typeof s === "object" ? s.name : s))
            : [];

          return (
            <label
              key={tech.id}
              htmlFor={`tech-radio-${tech.id}`}
              className={cn(
                "relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs select-none",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                  : "border-border bg-card hover:border-border hover:bg-muted/30",
                disabled && "opacity-60 cursor-not-allowed pointer-events-none",
              )}
            >
              <input
                type="radio"
                id={`tech-radio-${tech.id}`}
                name="selected-technician"
                value={tech.id}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onSelect(tech.id)}
                className="sr-only"
              />

              <div className="size-4 mt-0.5 rounded-full border border-input flex items-center justify-center shrink-0 bg-background">
                {isSelected && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </div>

              <div className="space-y-1.5 w-full min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-charcoal-900 dark:text-charcoal-100 truncate">
                    {tech.name}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Briefcase className="size-3" />
                    <span>{tech.activeJobCount} active jobs</span>
                  </span>
                  {tech.yearsOfExperience !== undefined && (
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3 text-amber-500" />
                      <span>{tech.yearsOfExperience}y exp</span>
                    </span>
                  )}
                </div>

                {skillList.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {skillList.slice(0, 2).map((skillName, sIdx) => (
                      <Badge
                        // biome-ignore lint/suspicious/noArrayIndexKey: Badges
                        key={sIdx}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 font-medium"
                      >
                        {skillName}
                      </Badge>
                    ))}
                    {skillList.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{skillList.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
