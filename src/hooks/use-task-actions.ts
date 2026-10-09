"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-client";
import { technicianService } from "@/services/technician.service";

interface UseTaskActionsOptions {
  taskId: string;
  onSuccess?: () => void;
  refetchTask?: () => Promise<unknown>;
}

export function useTaskActions({
  taskId,
  onSuccess,
  refetchTask,
}: UseTaskActionsOptions) {
  const queryClient = useQueryClient();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["technician", "tasks"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["technician", "task", taskId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["admin", "work-orders", taskId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["admin", "work-orders", taskId, "history"],
    });
  };

  // 1. Accept Task Mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      return technicianService.acceptTask(taskId);
    },
    onSuccess: async () => {
      toast.success("Job accepted", {
        description:
          "The dispatcher has been notified to schedule the visit window.",
      });
      await invalidateAll();
      onSuccess?.();
    },
    onError: async (err) => {
      toast.error(getErrorMessage(err));
      if (refetchTask) await refetchTask();
    },
  });

  // 2. Reject Task Mutation
  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      return technicianService.rejectTask(taskId, reason);
    },
    onSuccess: async () => {
      toast.success("Job rejected", {
        description: "It has been sent back to the dispatcher.",
      });
      await invalidateAll();
      onSuccess?.();
    },
    onError: async (err) => {
      toast.error(getErrorMessage(err));
      if (refetchTask) await refetchTask();
    },
  });

  // 3. Advance Status Mutation (ARRIVED, IN_PROGRESS)
  const advanceStatusMutation = useMutation({
    mutationFn: async (status: "ARRIVED" | "IN_PROGRESS") => {
      return technicianService.updateTaskStatus(taskId, status);
    },
    onSuccess: async (_, variables) => {
      const description =
        variables === "ARRIVED"
          ? "You are marked as arrived at the customer location."
          : "Service execution has been started.";

      const title =
        variables === "ARRIVED" ? "Arrival confirmed" : "Work started";

      toast.success(title, { description });
      await invalidateAll();
      onSuccess?.();
    },
    onError: async (err) => {
      toast.error(getErrorMessage(err));
      if (refetchTask) await refetchTask();
    },
  });

  const isBusy =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    advanceStatusMutation.isPending;

  return {
    acceptTask: () => acceptMutation.mutate(),
    rejectTask: (reason: string) => rejectMutation.mutate(reason),
    advanceStatus: (status: "ARRIVED" | "IN_PROGRESS") =>
      advanceStatusMutation.mutate(status),
    isBusy,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isAdvancing: advanceStatusMutation.isPending,
  };
}
