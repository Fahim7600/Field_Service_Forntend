"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messages, notify } from "@/lib/notify";
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
      notify.success(
        messages.tasks.accepted.title,
        messages.tasks.accepted.description,
      );
      await invalidateAll();
      onSuccess?.();
    },
    onError: async () => {
      if (refetchTask) await refetchTask();
    },
  });

  // 2. Reject Task Mutation
  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      return technicianService.rejectTask(taskId, reason);
    },
    onSuccess: async () => {
      notify.success(
        messages.tasks.rejected.title,
        messages.tasks.rejected.description,
      );
      await invalidateAll();
      onSuccess?.();
    },
    onError: async () => {
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

      notify.success(title, description);
      await invalidateAll();
      onSuccess?.();
    },
    onError: async () => {
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
