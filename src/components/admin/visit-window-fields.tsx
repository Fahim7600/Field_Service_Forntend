"use client";

import { AlertCircle, Calendar, Clock, Globe } from "lucide-react";
import * as React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toLocalInputValue } from "@/lib/format";
import type { VisitWindowValues } from "@/lib/validations/dispatch";

interface VisitWindowFieldsProps {
  register: UseFormRegister<VisitWindowValues>;
  errors: FieldErrors<VisitWindowValues>;
  hint?: string | null;
  disabled?: boolean;
  className?: string;
}

export function VisitWindowFields({
  register,
  errors,
  hint,
  disabled = false,
  className = "",
}: VisitWindowFieldsProps) {
  // Current time in local input format for `min` attribute
  const minDateTime = React.useMemo(() => {
    return toLocalInputValue(new Date().toISOString());
  }, []);

  const timeZone = React.useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "Local Time";
    }
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {hint && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground">
          <Calendar className="size-3.5 text-primary shrink-0" />
          <span>
            <strong>Customer prefers:</strong> {hint}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Visit Start Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="visit-start"
            className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200 flex items-center gap-1"
          >
            <Clock className="size-3 text-muted-foreground" />
            <span>Visit Start Time</span>
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="visit-start"
            type="datetime-local"
            min={minDateTime}
            disabled={disabled}
            {...register("start")}
            className={
              errors.start
                ? "border-destructive focus-visible:ring-destructive/20 text-xs"
                : "text-xs"
            }
          />
          {errors.start && (
            <p className="text-[11px] text-destructive flex items-center gap-1 font-medium pt-0.5">
              <AlertCircle className="size-3 shrink-0" />
              <span>{errors.start.message}</span>
            </p>
          )}
        </div>

        {/* Visit End Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="visit-end"
            className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200 flex items-center gap-1"
          >
            <Clock className="size-3 text-muted-foreground" />
            <span>Visit End Time</span>
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="visit-end"
            type="datetime-local"
            min={minDateTime}
            disabled={disabled}
            {...register("end")}
            className={
              errors.end
                ? "border-destructive focus-visible:ring-destructive/20 text-xs"
                : "text-xs"
            }
          />
          {errors.end && (
            <p className="text-[11px] text-destructive flex items-center gap-1 font-medium pt-0.5">
              <AlertCircle className="size-3 shrink-0" />
              <span>{errors.end.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* Timezone Information */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Globe className="size-3 shrink-0 text-muted-foreground/70" />
        <span>Times are in your timezone: {timeZone}</span>
      </div>
    </div>
  );
}
