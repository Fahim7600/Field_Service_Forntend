"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  User,
} from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";

import { VisitWindowFields } from "@/components/admin/visit-window-fields";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAvailableTechnicians } from "@/hooks/use-available-technicians";
import { getErrorMessage } from "@/lib/api-client";
import { safeFormatDate, safeFormatDateTime } from "@/lib/format";
import { messages, notify } from "@/lib/notify";
import {
  type VisitWindowValues,
  visitWindowSchema,
  windowToIso,
} from "@/lib/validations/dispatch";
import { adminService } from "@/services/admin.service";
import type { ServiceRequestDetail } from "@/types/api";
import type { WorkOrder } from "@/types/work-order";

interface ScheduleVisitCardProps {
  workOrder: WorkOrder;
  request?: ServiceRequestDetail | null;
  onSuccess?: () => void;
}

export function ScheduleVisitCard({
  workOrder,
  request,
  onSuccess,
}: ScheduleVisitCardProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const technician = workOrder.technician;
  const technicianName = technician?.name || "Assigned Technician";
  const technicianId =
    technician?.id || workOrder.assignedTechnicianId || workOrder.technicianId;

  const skillId =
    workOrder.request?.category?.skillId ||
    request?.category?.skillId ||
    request?.categoryId;

  // Preferred time hint from request
  const preferredHint = React.useMemo(() => {
    if (request?.preferredAt) return safeFormatDateTime(request.preferredAt);
    if (request?.preferredDate) return safeFormatDate(request.preferredDate);
    return null;
  }, [request]);

  // Acceptance signal check
  const hasExplicitAcceptField = workOrder.acceptedAt !== undefined;
  const isAccepted = Boolean(workOrder.acceptedAt);
  const isWaitingForAcceptance = hasExplicitAcceptField && !isAccepted;

  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<VisitWindowValues>({
    resolver: zodResolver(visitWindowSchema),
    mode: "onChange",
    defaultValues: {
      start: "",
      end: "",
    },
  });

  const formValues = watch();
  const isoWindow = React.useMemo(() => {
    if (!formValues.start || !formValues.end) return null;
    return windowToIso(formValues);
  }, [formValues]);

  // Non-blocking availability check for the assigned technician
  const {
    technicians: availableTechs,
    isLoading: isCheckingAvailability,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useAvailableTechnicians({
    skillId,
    startIso: isoWindow?.startIso,
    endIso: isoWindow?.endIso,
  });

  // Calculate availability hint
  const availabilityHint = React.useMemo(() => {
    if (
      !isoWindow ||
      !technicianId ||
      isCheckingAvailability ||
      availabilityError
    ) {
      return null;
    }
    const isTechFree = availableTechs.some((t) => t.id === technicianId);
    if (isTechFree) {
      return {
        type: "free" as const,
        message: `${technicianName} appears free in this window`,
      };
    }
    return {
      type: "busy" as const,
      message: `${technicianName} may already have a visit in this window`,
    };
  }, [
    isoWindow,
    technicianId,
    technicianName,
    availableTechs,
    isCheckingAvailability,
    availabilityError,
  ]);

  // Schedule mutation
  const scheduleMutation = useMutation({
    meta: { silent: true },
    mutationFn: async (values: VisitWindowValues) => {
      setErrorMessage(null);
      const iso = windowToIso(values);
      if (!iso) throw new Error("Invalid visit window dates");

      return adminService.scheduleVisit(workOrder.id, {
        visitStart: iso.startIso,
        visitEnd: iso.endIso,
      });
    },
    onSuccess: async () => {
      notify.success(
        messages.dispatch.scheduleSet.title,
        messages.dispatch.scheduleSet.description,
      );

      await queryClient.invalidateQueries({
        queryKey: ["admin", "work-orders", workOrder.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "work-orders", workOrder.id, "history"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "work-orders"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "dispatch-queue"],
      });

      onSuccess?.();
    },
    onError: async (err: unknown) => {
      const msg = getErrorMessage(err);
      const isConflict =
        msg.toLowerCase().includes("conflict") ||
        msg.toLowerCase().includes("overlap") ||
        (err &&
          typeof err === "object" &&
          "status" in err &&
          err.status === 409);

      if (isConflict) {
        setErrorMessage(
          messages.dispatch.scheduleConflict.description ||
            `${technicianName} already has a visit that overlaps this time. Please choose a different time.`,
        );
      } else {
        setErrorMessage(msg || "Failed to schedule visit. Please try again.");
      }
      refetchAvailability();
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isWaitingForAcceptance) return;
    scheduleMutation.mutate(formValues);
  };

  const isScheduleDisabled =
    !isValid || isWaitingForAcceptance || scheduleMutation.isPending;

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Calendar className="size-4 text-primary" />
            <span>Schedule Service Visit</span>
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Set the confirmed visit window for the assigned field technician.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Assigned Technician Summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/60 text-xs">
          <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="size-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
              Assigned Technician
            </span>
            <p className="font-bold text-charcoal-900 dark:text-charcoal-100 truncate">
              {technicianName}
            </p>
            {technician?.email && (
              <p className="text-[11px] text-muted-foreground truncate">
                {technician.email}
              </p>
            )}
          </div>
        </div>

        {/* Acceptance Warning / Status */}
        {isWaitingForAcceptance ? (
          <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-xs font-bold">
              Pending Technician Acceptance
            </AlertTitle>
            <AlertDescription className="text-[11px] pt-0.5">
              Waiting for {technicianName} to accept this job before the visit
              can be scheduled.
            </AlertDescription>
          </Alert>
        ) : !hasExplicitAcceptField ? (
          <p className="text-[11px] text-muted-foreground italic flex items-center gap-1">
            <Info className="size-3 shrink-0" />
            <span>
              The backend will reject scheduling until the technician has
              accepted.
            </span>
          </p>
        ) : null}

        {/* Error or Conflict Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="text-xs">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs font-bold">
              Scheduling Error
            </AlertTitle>
            <AlertDescription className="text-[11px] pt-0.5">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div
            className={
              isWaitingForAcceptance ? "opacity-60 pointer-events-none" : ""
            }
          >
            <VisitWindowFields
              register={register}
              errors={errors}
              hint={preferredHint}
              disabled={isWaitingForAcceptance || scheduleMutation.isPending}
            />
          </div>

          {/* Availability Hint */}
          {availabilityHint && !isWaitingForAcceptance && (
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${
                availabilityHint.type === "free"
                  ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
              }`}
            >
              {availabilityHint.type === "free" ? (
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{availabilityHint.message}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 border-t border-border/60">
            <Button
              type="submit"
              variant="default"
              className="w-full justify-center gap-2 font-semibold shadow-xs"
              disabled={isScheduleDisabled}
            >
              {scheduleMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              <span>
                {scheduleMutation.isPending
                  ? "Scheduling..."
                  : "Schedule Visit"}
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
