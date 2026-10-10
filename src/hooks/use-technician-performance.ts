"use client";

import { useQuery } from "@tanstack/react-query";
import {
  computeTechnicianStats,
  type TechnicianPerformanceStats,
} from "@/lib/technician-stats";
import { technicianService } from "@/services/technician.service";
import type { PaginatedResponse, TechnicianTask } from "@/types/api";

export interface UseTechnicianPerformanceResult {
  stats: TechnicianPerformanceStats | null;
  tasks: TechnicianTask[];
  total: number | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  refetch: () => void;
}

export function useTechnicianPerformance(): UseTechnicianPerformanceResult {
  const query = useQuery<PaginatedResponse<TechnicianTask>, Error>({
    queryKey: ["technician-performance"],
    queryFn: () =>
      technicianService.fetchMyTasks({
        limit: 100,
        sortBy: "createdAt",
        order: "desc",
      }),
    staleTime: 60_000,
    meta: { skipToast: true },
  });

  const rawData = query.data?.data;
  const total = query.data?.pagination?.total ?? null;

  const stats = query.data ? computeTechnicianStats(rawData, total) : null;

  return {
    stats,
    tasks: Array.isArray(rawData) ? rawData : [],
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
