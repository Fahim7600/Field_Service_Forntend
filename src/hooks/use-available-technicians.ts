"use client";

import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/hooks/use-debounce";
import { getErrorMessage } from "@/lib/api-client";
import { extractArray } from "@/lib/extract-data";
import { adminService } from "@/services/admin.service";
import type { AvailableTechnician } from "@/types/work-order";

interface UseAvailableTechniciansProps {
  skillId?: string;
  startIso?: string | null;
  endIso?: string | null;
  page?: number;
  limit?: number;
}

export function useAvailableTechnicians({
  skillId,
  startIso,
  endIso,
  page = 1,
  limit = 20,
}: UseAvailableTechniciansProps) {
  // Debounce the ISO timestamps to avoid spamming the backend during typing
  const debouncedStart = useDebounce(startIso, 400);
  const debouncedEnd = useDebounce(endIso, 400);

  const isEnabled = Boolean(skillId && debouncedStart && debouncedEnd);

  const query = useQuery({
    queryKey: [
      "admin",
      "available-technicians",
      { skillId, start: debouncedStart, end: debouncedEnd, page, limit },
    ],
    queryFn: async () => {
      if (!skillId) throw new Error("Skill ID is required");
      return adminService.fetchAvailableTechnicians({
        skillId,
        start: debouncedStart || undefined,
        end: debouncedEnd || undefined,
        page,
        limit,
      });
    },
    enabled: isEnabled,
    staleTime: 0,
    retry: (failureCount, err) => {
      const msg = getErrorMessage(err);
      if (
        msg.includes("400") ||
        msg.includes("404") ||
        msg.includes("422") ||
        (err &&
          typeof err === "object" &&
          "status" in err &&
          typeof err.status === "number" &&
          err.status >= 400 &&
          err.status < 500)
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const technicians = extractArray<AvailableTechnician>(query.data);

  return {
    ...query,
    technicians,
    isEnabled,
  };
}
