"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { ImageUploader } from "@/components/forms/image-uploader";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCompleteJob } from "@/hooks/use-complete-job";
import { loadDraft, saveDraft } from "@/lib/report-draft";
import { cn } from "@/lib/utils";
import {
  type ServiceReportFormValues,
  serviceReportSchema,
} from "@/lib/validations/service-report";
import { technicianService } from "@/services/technician.service";

interface ServiceReportClientProps {
  id: string;
}

export function ServiceReportClient({ id }: ServiceReportClientProps) {
  const [isUploadingPhotos, setIsUploadingPhotos] = React.useState(false);
  const [draftRestored, setDraftRestored] = React.useState(false);

  // Fetch Task
  const {
    data: task,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["technician", "task", id],
    queryFn: () => technicianService.fetchTaskById(id),
    staleTime: 10_000,
  });

  const {
    state: completionState,
    errorMessage: completionError,
    isBusy,
    isReportSaved,
    submitAndComplete,
    retryCompletion,
    markReportAlreadySaved,
  } = useCompleteJob({
    workOrderId: id,
    refetchTask: refetch,
  });

  const form = useForm<ServiceReportFormValues>({
    resolver: zodResolver(serviceReportSchema),
    mode: "onTouched",
    defaultValues: {
      workDone: "",
      partsUsed: "",
      hoursSpent: 1,
      photos: [],
    },
  });

  // Restore draft on mount
  React.useEffect(() => {
    if (!draftRestored && task) {
      const draft = loadDraft(id);
      if (draft) {
        form.reset({
          workDone: draft.workDone || "",
          partsUsed: draft.partsUsed || "",
          hoursSpent: draft.hoursSpent || 1,
          photos: draft.photos || [],
        });
      }
      setDraftRestored(true);
    }
  }, [id, task, draftRestored, form]);

  // If task already has a report from backend, mark step 1 done
  React.useEffect(() => {
    if (task?.hasReport || task?.serviceReport) {
      markReportAlreadySaved();
    }
  }, [task, markReportAlreadySaved]);

  // Debounced auto-save draft while typing
  const watchedValues = form.watch();
  React.useEffect(() => {
    if (!draftRestored || isReportSaved) return;

    const timer = setTimeout(() => {
      saveDraft(id, watchedValues);
    }, 500);

    return () => clearTimeout(timer);
  }, [id, watchedValues, draftRestored, isReportSaved]);

  // Prevent accidental navigation when form is dirty or photos are uploading
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((form.formState.isDirty || isUploadingPhotos) && !isReportSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty, isUploadingPhotos, isReportSaved]);

  // 1. Loading State
  if (isLoading) {
    return (
      <Container className="py-6 space-y-6 max-w-4xl">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 2. Error / 403 / 404 State
  if (isError || !task) {
    return (
      <Container className="py-8 max-w-2xl">
        <Card className="border-border">
          <CardContent className="p-8 text-center space-y-4">
            <div className="size-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                This job is not available
              </h2>
              <p className="text-sm text-muted-foreground">
                {(error as Error)?.message ||
                  "You may not have permission to view this task, or it may have been reassigned."}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/technician/tasks"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Back to my tasks
              </Link>
              <Button variant="default" onClick={() => refetch()}>
                <RefreshCw className="size-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const isCompleted = ["COMPLETED", "INVOICED", "PAID", "CLOSED"].includes(
    task.status,
  );
  const isInProgress = task.status === "IN_PROGRESS";
  const hasExistingReport = Boolean(task.hasReport || task.serviceReport);

  // 3. Guard: Job is already completed
  if (isCompleted) {
    return (
      <Container className="py-8 max-w-2xl">
        <Card className="border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/10">
          <CardContent className="p-8 text-center space-y-4">
            <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                This job is already completed
              </h2>
              <p className="text-sm text-muted-foreground">
                The service report for Task #
                {task.workOrderNumber || id.slice(0, 8)} has been submitted and
                processed.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <Link
                href={`/technician/tasks/${id}`}
                className={cn(buttonVariants({ variant: "default" }))}
              >
                <ArrowLeft className="size-4 mr-2" />
                View task details
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 4. Guard: Not In Progress
  if (!isInProgress) {
    return (
      <Container className="py-8 max-w-2xl">
        <Card className="border-amber-500/20 bg-amber-50/10 dark:bg-amber-950/10">
          <CardContent className="p-8 text-center space-y-4">
            <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Work not started yet
              </h2>
              <p className="text-sm text-muted-foreground">
                You can file the service report once the job is in progress
                (current status:{" "}
                <strong className="font-semibold text-foreground">
                  {task.status}
                </strong>
                ).
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <Link
                href={`/technician/tasks/${id}`}
                className={cn(buttonVariants({ variant: "default" }))}
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to task #{task.workOrderNumber || id.slice(0, 8)}
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 5. Guard: Report already saved, but job not marked COMPLETED (Step 2 recovery)
  if (
    hasExistingReport ||
    completionState === "error-complete" ||
    completionState === "report-saved"
  ) {
    return (
      <Container className="py-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-2">
          <Link
            href={`/technician/tasks/${id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 gap-1 text-muted-foreground hover:text-foreground text-xs",
            )}
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to task #{task.workOrderNumber || id.slice(0, 8)}</span>
          </Link>
        </div>

        <PageHeader
          title="Service Report Saved"
          description={`Report filed for Job #${task.workOrderNumber || id.slice(0, 8)}`}
        />

        <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-bold text-sm">
            Report is saved — Completion pending
          </AlertTitle>
          <AlertDescription className="text-xs pt-1 text-amber-800 dark:text-amber-300">
            {completionError
              ? `Your report was saved, but the job could not be marked as completed: ${completionError}`
              : "Your service report is already stored in the system. Click below to complete the job and trigger invoice generation."}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck2 className="size-5 text-emerald-600" />
              Finalize Job Completion
            </CardTitle>
            <CardDescription>
              Marking this job as completed will notify dispatch and prepare the
              customer invoice.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex items-center justify-between border-t border-border pt-4">
            <Link
              href={`/technician/tasks/${id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Back to task
            </Link>
            <Button
              variant="default"
              onClick={retryCompletion}
              disabled={isBusy}
            >
              {isBusy ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Marking completed...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Mark job as completed
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </Container>
    );
  }

  // 6. Active Report Form
  const onSubmit = async (values: ServiceReportFormValues) => {
    await submitAndComplete(values);
  };

  const workDoneLength = form.watch("workDone")?.length || 0;

  return (
    <Container className="py-6 space-y-6 max-w-3xl">
      {/* Navigation & Header */}
      <div className="flex items-center gap-2">
        <Link
          href={`/technician/tasks/${id}`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 gap-1 text-muted-foreground hover:text-foreground text-xs",
          )}
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to task #{task.workOrderNumber || id.slice(0, 8)}</span>
        </Link>
      </div>

      <PageHeader
        title="Submit Service Report"
        description={`Record completion summary, parts used, hours spent, and photos for Job #${task.workOrderNumber || id.slice(0, 8)}.`}
      />

      {/* Summary Header Card */}
      <Card className="border-border bg-slate-50/50 dark:bg-slate-900/30">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <span className="text-muted-foreground">Customer: </span>
              <span className="font-semibold text-foreground">
                {task.customer?.name || "Customer"}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="truncate">
              <span className="text-muted-foreground">Location: </span>
              <span className="font-medium text-foreground">
                {task.request?.address || "Address not provided"}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:col-span-2">
            <Wrench className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <span className="text-muted-foreground">Service: </span>
              <span className="font-medium text-foreground">
                {task.request?.category?.name
                  ? `${task.request.category.name} — `
                  : ""}
                {task.request?.title || "Field Service"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1 Error Alert if any */}
      {completionState === "error-report" && completionError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle className="font-bold text-sm">
            Submission failed
          </AlertTitle>
          <AlertDescription className="text-xs pt-1">
            {completionError}
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4 text-brand-600" />
              Work Details
            </CardTitle>
            <CardDescription>
              All text fields auto-save locally to prevent lost progress.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Work Done */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="workDone" className="text-xs font-semibold">
                  Work Performed <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {workDoneLength}/2000 chars
                </span>
              </div>
              <Textarea
                id="workDone"
                rows={4}
                placeholder="Describe the diagnosis, actions taken, and final outcome..."
                disabled={isBusy}
                {...form.register("workDone")}
                className={cn(
                  form.formState.errors.workDone && "border-rose-500",
                )}
              />
              {form.formState.errors.workDone ? (
                <p className="text-xs font-medium text-rose-500">
                  {form.formState.errors.workDone.message}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Minimum 10 characters detailing the physical labor and tests
                  performed.
                </p>
              )}
            </div>

            {/* Parts Used */}
            <div className="space-y-1.5">
              <Label htmlFor="partsUsed" className="text-xs font-semibold">
                Parts / Materials Used (Optional)
              </Label>
              <Textarea
                id="partsUsed"
                rows={3}
                placeholder="e.g. 1x 45uF Capacitor, 2kg R410A Refrigerant, 1x Filter"
                disabled={isBusy}
                {...form.register("partsUsed")}
              />
              <p className="text-[11px] text-muted-foreground">
                List any replaced components, consumables, or billable
                materials.
              </p>
            </div>

            {/* Hours Spent */}
            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="hoursSpent" className="text-xs font-semibold">
                Hours Spent <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="hoursSpent"
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  inputMode="decimal"
                  placeholder="1.5"
                  disabled={isBusy}
                  {...form.register("hoursSpent")}
                  className={cn(
                    form.formState.errors.hoursSpent && "border-rose-500",
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  hrs
                </span>
              </div>
              {form.formState.errors.hoursSpent ? (
                <p className="text-xs font-medium text-rose-500">
                  {form.formState.errors.hoursSpent.message}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Increment of 0.25 (15-minute billing increments).
                </p>
              )}
            </div>

            {/* Completion Photos */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <Controller
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <ImageUploader
                    value={field.value || []}
                    onChange={(urls) => field.onChange(urls)}
                    onUploadingChange={setIsUploadingPhotos}
                    disabled={isBusy}
                    label="Completion Photos (Optional)"
                    maxFiles={5}
                  />
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border pt-4 bg-slate-50/50 dark:bg-slate-900/20">
            <Link
              href={`/technician/tasks/${id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Cancel
            </Link>

            <Button
              type="submit"
              variant="default"
              disabled={isBusy || isUploadingPhotos || !form.formState.isValid}
            >
              {isBusy ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {completionState === "saving-report"
                    ? "Submitting report..."
                    : "Completing job..."}
                </>
              ) : isUploadingPhotos ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Uploading photos...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Submit report and complete job
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Container>
  );
}
