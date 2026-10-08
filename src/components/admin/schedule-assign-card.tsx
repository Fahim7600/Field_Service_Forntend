"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  UserCheck,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-client";
import { extractArray } from "@/lib/extract-data";
import { formatSafeDateTime } from "@/lib/format-date";
import { adminService } from "@/services/admin.service";
import type { AvailableTechnician } from "@/types/api";

interface ScheduleAssignCardProps {
  workOrderId: string;
  requestId: string;
  skillId?: string;
  skillName?: string;
  preferredAt?: string;
  customerAddress?: string;
  existingVisitStart?: string | null;
  existingVisitEnd?: string | null;
  existingTechnicianId?: string | null;
}

export function ScheduleAssignCard({
  workOrderId,
  requestId,
  skillId,
  skillName,
  preferredAt,
  customerAddress,
  existingVisitStart,
  existingVisitEnd,
  existingTechnicianId,
}: ScheduleAssignCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize schedule date & time state defensively
  const getInitialDates = () => {
    // If existing visit dates exist, use them
    if (existingVisitStart && existingVisitEnd) {
      const dStart = new Date(existingVisitStart);
      const dEnd = new Date(existingVisitEnd);
      if (!Number.isNaN(dStart.getTime()) && !Number.isNaN(dEnd.getTime())) {
        const yyyy = dStart.getFullYear();
        const mm = String(dStart.getMonth() + 1).padStart(2, "0");
        const dd = String(dStart.getDate()).padStart(2, "0");
        const startH = String(dStart.getHours()).padStart(2, "0");
        const startM = String(dStart.getMinutes()).padStart(2, "0");
        const endH = String(dEnd.getHours()).padStart(2, "0");
        const endM = String(dEnd.getMinutes()).padStart(2, "0");
        return {
          dateStr: `${yyyy}-${mm}-${dd}`,
          startTime: `${startH}:${startM}`,
          endTime: `${endH}:${endM}`,
        };
      }
    }

    // Default to tomorrow 10:00 to 12:00 or preferred date
    const targetDate = preferredAt ? new Date(preferredAt) : new Date();
    if (
      Number.isNaN(targetDate.getTime()) ||
      targetDate.getTime() <= Date.now()
    ) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dd = String(targetDate.getDate()).padStart(2, "0");

    return {
      dateStr: `${yyyy}-${mm}-${dd}`,
      startTime: "10:00",
      endTime: "12:00",
    };
  };

  const initial = getInitialDates();
  const [selectedDate, setSelectedDate] = React.useState(initial.dateStr);
  const [startTime, setStartTime] = React.useState(initial.startTime);
  const [endTime, setEndTime] = React.useState(initial.endTime);
  const [selectedTechId, setSelectedTechId] = React.useState<string>(
    existingTechnicianId || "",
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Compute ISO timestamps and validation status
  const scheduleValidation = React.useMemo(() => {
    if (!selectedDate || !startTime || !endTime) {
      return {
        isValid: false,
        error: "Please enter date, start time, and end time.",
      };
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    if (
      Number.isNaN(startH) ||
      Number.isNaN(startM) ||
      Number.isNaN(endH) ||
      Number.isNaN(endM)
    ) {
      return { isValid: false, error: "Invalid time format." };
    }

    const startObj = new Date(`${selectedDate}T${startTime}:00`);
    const endObj = new Date(`${selectedDate}T${endTime}:00`);

    if (Number.isNaN(startObj.getTime()) || Number.isNaN(endObj.getTime())) {
      return { isValid: false, error: "Invalid date or time." };
    }

    if (startObj.getTime() <= Date.now()) {
      return {
        isValid: false,
        error: "Visit start time must be scheduled in the future.",
      };
    }

    if (endObj.getTime() <= startObj.getTime()) {
      return {
        isValid: false,
        error: "End time must be after start time.",
      };
    }

    return {
      isValid: true,
      startIso: startObj.toISOString(),
      endIso: endObj.toISOString(),
      startObj,
      endObj,
    };
  }, [selectedDate, startTime, endTime]);

  // Query available technicians automatically when valid schedule is set
  const {
    data: techData,
    isLoading: isTechLoading,
    isFetching: isTechFetching,
    error: techError,
  } = useQuery({
    queryKey: [
      "admin",
      "available-technicians",
      {
        skillId: skillId || "",
        start: scheduleValidation.startIso,
        end: scheduleValidation.endIso,
      },
    ],
    queryFn: async () => {
      if (
        !skillId ||
        !scheduleValidation.startIso ||
        !scheduleValidation.endIso
      ) {
        return { data: [] };
      }
      return adminService.fetchAvailableTechnicians({
        skillId,
        start: scheduleValidation.startIso,
        end: scheduleValidation.endIso,
      });
    },
    enabled: Boolean(
      skillId &&
        scheduleValidation.isValid &&
        scheduleValidation.startIso &&
        scheduleValidation.endIso,
    ),
    staleTime: 10000,
  });

  const availableTechs: AvailableTechnician[] =
    extractArray<AvailableTechnician>(techData);

  // Reset selected technician if they are no longer available in the new list
  React.useEffect(() => {
    if (
      selectedTechId &&
      availableTechs.length > 0 &&
      !availableTechs.some((t) => t.id === selectedTechId)
    ) {
      setSelectedTechId("");
    }
  }, [availableTechs, selectedTechId]);

  // Preset time helpers
  const applyPreset = (startH: string, endH: string) => {
    setStartTime(startH);
    setEndTime(endH);
  };

  // Submit handler: Chaining scheduleWorkOrder + assignWorkOrder
  const handleFinalizeAssignment = async () => {
    if (
      !scheduleValidation.isValid ||
      !scheduleValidation.startIso ||
      !scheduleValidation.endIso
    ) {
      toast.error(
        scheduleValidation.error || "Please select a valid visit window.",
      );
      return;
    }

    if (!selectedTechId) {
      toast.error("Please select an available technician.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step A: Schedule the visit window
      await adminService.scheduleWorkOrder(workOrderId, {
        visitStart: scheduleValidation.startIso,
        visitEnd: scheduleValidation.endIso,
      });

      // Step B: Assign technician
      await adminService.assignWorkOrder(workOrderId, {
        technicianId: selectedTechId,
      });

      toast.success("Visit scheduled and technician assigned successfully!");

      await queryClient.invalidateQueries({
        queryKey: ["requests", requestId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "dispatch-queue"],
      });
      await queryClient.invalidateQueries({ queryKey: ["work-orders"] });

      router.push("/admin/dispatch");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/80 bg-panel/50 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Schedule & Assign Work Order
              </CardTitle>
              <CardDescription className="text-xs">
                Work Order #
                <span className="font-mono">{workOrderId.slice(0, 8)}</span>
              </CardDescription>
            </div>
          </div>
          {skillName && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Wrench className="size-3 text-primary" />
              <span>{skillName}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Customer Address Reference if present */}
        {customerAddress && (
          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
            <span>
              Target Address:{" "}
              <strong className="text-foreground">{customerAddress}</strong>
            </span>
          </div>
        )}

        {/* Part A: Schedule Visit Window */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300">
              Part 1: Visit Window
            </Label>
            {preferredAt && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" />
                Customer requested: {formatSafeDateTime(preferredAt)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="visit-date" className="text-xs font-medium">
                Visit Date
              </Label>
              <Input
                id="visit-date"
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start-time" className="text-xs font-medium">
                Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-time" className="text-xs font-medium">
                End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground mr-1">
              Quick Slots:
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 text-[11px] px-2 py-0"
              onClick={() => applyPreset("09:00", "12:00")}
            >
              Morning (09:00 - 12:00)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 text-[11px] px-2 py-0"
              onClick={() => applyPreset("13:00", "16:00")}
            >
              Afternoon (13:00 - 16:00)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 text-[11px] px-2 py-0"
              onClick={() => applyPreset("16:00", "19:00")}
            >
              Late (16:00 - 19:00)
            </Button>
          </div>

          {!scheduleValidation.isValid && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="size-3.5 shrink-0" />
              {scheduleValidation.error}
            </p>
          )}
        </div>

        {/* Part B: Technician Selection */}
        <div className="space-y-3 border-t border-border/60 pt-5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300">
              Part 2: Available Technician
            </Label>
            {isTechFetching && (
              <span className="text-[11px] text-primary flex items-center gap-1 animate-pulse">
                <Loader2 className="size-3 animate-spin" />
                Checking availability...
              </span>
            )}
          </div>

          {!skillId ? (
            <Alert variant="warning">
              <AlertTriangle className="size-4" />
              <AlertTitle>Skill Requirement Missing</AlertTitle>
              <AlertDescription>
                This service request does not have a linked skill category.
                Technicians cannot be queried by skill.
              </AlertDescription>
            </Alert>
          ) : !scheduleValidation.isValid ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Select a valid date and time above to view active technicians with
              no schedule conflicts.
            </div>
          ) : isTechLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : techError ? (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Failed to fetch technician availability</AlertTitle>
              <AlertDescription>
                {techError instanceof Error
                  ? techError.message
                  : "Error fetching technicians."}
              </AlertDescription>
            </Alert>
          ) : availableTechs.length === 0 ? (
            <Alert
              variant="warning"
              className="border-amber-500/40 bg-amber-500/10"
            >
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-900 dark:text-amber-200">
                No active technicians available
              </AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-300">
                No active technicians with the required skill are available
                during this time slot. Please adjust the visit hours or date.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label
                  htmlFor="technician-select"
                  className="text-xs font-medium"
                >
                  Select Assignee ({availableTechs.length} available)
                </Label>
                <Select
                  value={selectedTechId}
                  onValueChange={(val) => setSelectedTechId(val ?? "")}
                >
                  <SelectTrigger
                    id="technician-select"
                    className="h-10 text-xs"
                  >
                    <SelectValue placeholder="Choose an available technician..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTechs.map((tech) => {
                      const exp = tech.yearsOfExperience
                        ? `${tech.yearsOfExperience} yrs exp`
                        : "New";
                      const jobs =
                        tech.activeJobCount !== undefined
                          ? `${tech.activeJobCount} active jobs`
                          : "";
                      const area = tech.serviceArea
                        ? `• ${tech.serviceArea}`
                        : "";

                      return (
                        <SelectItem
                          key={tech.id}
                          value={tech.id}
                          className="py-2"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-charcoal-900 dark:text-charcoal-100">
                              {tech.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {exp} {jobs ? `• ${jobs}` : ""} {area}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedTechId && (
                <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground flex items-center gap-2">
                  <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Technician selected:{" "}
                    <strong className="text-foreground">
                      {
                        availableTechs.find((t) => t.id === selectedTechId)
                          ?.name
                      }
                    </strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/80 bg-panel/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Briefcase className="size-3.5" />
          <span>Schedules visit window & assigns technician</span>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={
            !scheduleValidation.isValid ||
            !selectedTechId ||
            isSubmitting ||
            isTechLoading ||
            availableTechs.length === 0
          }
          onClick={handleFinalizeAssignment}
          className="w-full sm:w-auto gap-2 shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Finalizing Assignment...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              <span>Finalize Assignment</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
