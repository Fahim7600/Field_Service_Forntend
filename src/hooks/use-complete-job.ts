"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { clearDraft } from "@/lib/report-draft";
import type { ServiceReportFormValues } from "@/lib/validations/service-report";
import { technicianService } from "@/services/technician.service";

export type CompleteJobState =
  | "idle"
  | "saving-report"
  | "report-saved"
  | "completing"
  | "done"
  | "error-report"
  | "error-complete";

export interface UseCompleteJobOptions {
  workOrderId: string;
  onSuccess?: () => void;
  onStateChange?: (state: CompleteJobState) => void;
  refetchTask?: () => Promise<unknown>;
}

export function useCompleteJob({
  workOrderId,
  onSuccess,
  onStateChange,
  refetchTask,
}: UseCompleteJobOptions) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [state, setState] = React.useState<CompleteJobState>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);

  // Track if report is already successfully committed to avoid calling it twice
  const reportCommittedRef = React.useRef(false);

  const updateState = React.useCallback(
    (nextState: CompleteJobState, error?: string | null) => {
      setState(nextState);
      setErrorMessage(error ?? null);
      onStateChange?.(nextState);
    },
    [onStateChange],
  );

  const invalidateQueries = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["technician", "tasks"] }),
      queryClient.invalidateQueries({
        queryKey: ["technician", "task", workOrderId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["work-order", workOrderId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["work-order-history", workOrderId],
      }),
    ]);
  }, [queryClient, workOrderId]);

  /**
   * Completes the work order by updating its status to COMPLETED.
   * This is Step 2 and can be safely retried without resubmitting the report.
   */
  const completeStep2Only = React.useCallback(async () => {
    updateState("completing");

    try {
      await technicianService.updateTaskStatus(workOrderId, "COMPLETED");
      updateState("done");

      clearDraft(workOrderId);
      await invalidateQueries();

      toast.success("Job completed", {
        description: "Your report was submitted. Billing will follow.",
      });

      onSuccess?.();
      router.push("/technician/tasks?status=COMPLETED");
    } catch (err: unknown) {
      let msg = "Failed to mark job as completed";
      if (axios.isAxiosError(err)) {
        msg =
          (err.response?.data as { message?: string })?.message ||
          err.message ||
          msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      updateState("error-complete", msg);
      toast.error("Failed to complete job", { description: msg });

      // Always refetch task in case backend state changed
      if (refetchTask) {
        await refetchTask().catch(() => {});
      }
    }
  }, [
    workOrderId,
    updateState,
    invalidateQueries,
    onSuccess,
    router,
    refetchTask,
  ]);

  /**
   * Main submission: Step 1 (Save Report with multipart photos) -> Step 2 (Mark Completed).
   */
  const submitAndComplete = React.useCallback(
    async (values: ServiceReportFormValues) => {
      if (state === "saving-report" || state === "completing") {
        return;
      }

      // 1. Step 1: Submit Service Report (if not already committed)
      if (!reportCommittedRef.current) {
        updateState("saving-report");
        setUploadProgress(0);

        try {
          // OpenAPI spec requires partsUsed (non-empty string).
          // If empty/omitted in UI, normalize to "None" so backend validation passes.
          const normalizedPartsUsed = values.partsUsed?.trim() || "None";

          await technicianService.submitServiceReport(
            workOrderId,
            {
              workDone: values.workDone,
              hoursSpent: values.hoursSpent,
              partsUsed: normalizedPartsUsed,
              photos: values.photos,
            },
            (percent) => {
              setUploadProgress(percent);
            },
          );
          reportCommittedRef.current = true;
          updateState("report-saved");
        } catch (err: unknown) {
          let isDuplicate = false;
          let msg = "Failed to save service report";

          if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const resData = err.response?.data as {
              message?: string;
              errors?: string[];
            };
            msg = resData?.message || err.message || msg;

            // If 409 conflict or message indicates report already exists, treat step 1 as complete
            if (
              status === 409 ||
              (typeof msg === "string" &&
                msg.toLowerCase().includes("already exists"))
            ) {
              isDuplicate = true;
            }
          } else if (err instanceof Error) {
            msg = err.message;
          }

          if (isDuplicate) {
            reportCommittedRef.current = true;
            updateState("report-saved");
          } else {
            updateState("error-report", msg);
            toast.error("Failed to save report", { description: msg });

            if (refetchTask) {
              await refetchTask().catch(() => {});
            }
            return;
          }
        }
      }

      // 2. Step 2: Mark COMPLETED
      await completeStep2Only();
    },
    [state, workOrderId, updateState, completeStep2Only, refetchTask],
  );

  const isBusy =
    state === "saving-report" ||
    state === "report-saved" ||
    state === "completing";

  const isReportSaved =
    reportCommittedRef.current ||
    state === "report-saved" ||
    state === "error-complete" ||
    state === "completing" ||
    state === "done";

  return {
    state,
    errorMessage,
    uploadProgress,
    isBusy,
    isReportSaved,
    submitAndComplete,
    retryCompletion: completeStep2Only,
    markReportAlreadySaved: () => {
      reportCommittedRef.current = true;
      updateState("report-saved");
    },
  };
}
