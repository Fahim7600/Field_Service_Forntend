"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  UserCheck,
} from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TechnicianPicker } from "@/components/admin/technician-picker";
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
import {
  type VisitWindowValues,
  visitWindowSchema,
  windowToIso,
} from "@/lib/validations/dispatch";
import { adminService } from "@/services/admin.service";
import type { ServiceRequestDetail } from "@/types/api";
import type { WorkOrder, WorkOrderStatusHistoryItem } from "@/types/work-order";

interface AssignTechnicianCardProps {
  workOrder: WorkOrder;
  request?: ServiceRequestDetail | null;
  history?: WorkOrderStatusHistoryItem[] | null;
  onSuccess?: () => void;
}

export function AssignTechnicianCard({
  workOrder,
  request,
  history,
  onSuccess,
}: AssignTechnicianCardProps) {
  const queryClient = useQueryClient();
  const [selectedTechnicianId, setSelectedTechnicianId] = React.useState<
    string | undefined
  >();
  const [conflictError, setConflictError] = React.useState<string | null>(null);

  // Determine skillId from request or workOrder
  const skillId =
    workOrder.request?.category?.skillId ||
    request?.category?.skillId ||
    request?.categoryId;

  // Find if a technician previously rejected this job (ASSIGNED -> APPROVED transition)
  const previousRejection = React.useMemo(() => {
    if (!history || history.length === 0) return null;
    return history.find(
      (item) => item.fromStatus === "ASSIGNED" && item.toStatus === "APPROVED",
    );
  }, [history]);

  // Preferred time hint from request
  const preferredHint = React.useMemo(() => {
    if (request?.preferredAt) return safeFormatDateTime(request.preferredAt);
    if (request?.preferredDate) return safeFormatDate(request.preferredDate);
    return null;
  }, [request]);

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

  // Query available technicians for this skill & window
  const {
    technicians,
    isLoading: isLoadingTechnicians,
    error: techniciansError,
    refetch: refetchTechnicians,
    isEnabled: isLookupEnabled,
  } = useAvailableTechnicians({
    skillId,
    startIso: isoWindow?.startIso,
    endIso: isoWindow?.endIso,
  });

  // Assign technician mutation
  const assignMutation = useMutation({
    mutationFn: async (techId: string) => {
      setConflictError(null);
      return adminService.assignTechnician(workOrder.id, {
        technicianId: techId,
      });
    },
    onSuccess: async () => {
      toast.success("Technician assigned", {
        description: "Waiting for the technician to accept the job.",
      });

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
      // Check if error is a 409 or conflict/availability error
      const isConflict =
        msg.toLowerCase().includes("conflict") ||
        msg.toLowerCase().includes("already assigned") ||
        msg.toLowerCase().includes("no longer available") ||
        (err &&
          typeof err === "object" &&
          "status" in err &&
          err.status === 409);

      if (isConflict) {
        setConflictError(
          msg ||
            "The technician is no longer available or this job was already assigned. Please choose another technician.",
        );
        setSelectedTechnicianId(undefined);
        await queryClient.invalidateQueries({
          queryKey: ["admin", "work-orders", workOrder.id],
        });
        await refetchTechnicians();
      } else {
        toast.error(msg);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechnicianId) return;
    assignMutation.mutate(selectedTechnicianId);
  };

  // If work order has no skill ID
  if (!skillId) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
            <span>Missing Required Skill</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            This work order does not have an associated category skill ID.
            Technicians cannot be automatically queried without a required
            skill.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isAssignButtonDisabled =
    !isValid ||
    !selectedTechnicianId ||
    assignMutation.isPending ||
    isLoadingTechnicians;

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <UserCheck className="size-4 text-primary" />
            <span>Assign Field Technician</span>
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Select a time window to check technician availability, then assign an
          eligible technician.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Previous Rejection Banner */}
        {previousRejection && (
          <Alert
            variant="destructive"
            className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs"
          >
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Previously Rejected by Technician
            </AlertTitle>
            <AlertDescription className="text-[11px] pt-0.5 leading-relaxed">
              {typeof previousRejection.changedBy === "object" &&
              previousRejection.changedBy?.name
                ? `${previousRejection.changedBy.name} `
                : "A technician "}
              rejected this assignment:{" "}
              <strong>
                {previousRejection.note ||
                  previousRejection.reason ||
                  "No reason provided"}
              </strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Conflict Error Banner */}
        {conflictError && (
          <Alert variant="destructive" className="text-xs">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs font-bold">
              Assignment Conflict
            </AlertTitle>
            <AlertDescription className="text-[11px] pt-0.5">
              {conflictError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Visit Window Picker for Availability Lookup */}
          <VisitWindowFields
            register={register}
            errors={errors}
            hint={preferredHint}
            disabled={assignMutation.isPending}
          />

          {/* Step 2: Available Technicians Radio Picker */}
          <TechnicianPicker
            technicians={technicians}
            selectedId={selectedTechnicianId}
            onSelect={setSelectedTechnicianId}
            isLoading={isLoadingTechnicians}
            error={techniciansError}
            onRetry={refetchTechnicians}
            disabled={assignMutation.isPending}
            isWindowSelected={isLookupEnabled}
          />

          {/* Step 3: Submit Action */}
          <div className="pt-2 border-t border-border/60">
            <Button
              type="submit"
              variant="default"
              className="w-full justify-center gap-2 font-semibold shadow-xs"
              disabled={isAssignButtonDisabled}
            >
              {assignMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              <span>Assign Technician</span>
            </Button>

            <p className="text-[11px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <Info className="size-3" />
              <span>
                Assigns the job and notifies the technician for acceptance.
              </span>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
