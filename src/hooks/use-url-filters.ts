"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { RequestStatus } from "@/types/api";

export interface UrlFilters {
  page: number;
  limit: number;
  status?: RequestStatus | string;
  sortBy?: string;
  order?: "asc" | "desc";
  [key: string]: unknown;
}

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<UrlFilters>(() => {
    const rawPage = searchParams.get("page");
    const rawLimit = searchParams.get("limit");
    const status = searchParams.get("status") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const order = (searchParams.get("order") as "asc" | "desc") || undefined;

    const page =
      rawPage && !Number.isNaN(Number(rawPage))
        ? Math.max(1, Number(rawPage))
        : 1;
    const limit =
      rawLimit && !Number.isNaN(Number(rawLimit))
        ? Math.max(1, Number(rawLimit))
        : 10;

    return {
      page,
      limit,
      status,
      sortBy,
      order,
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (
      newFilters: Partial<Record<string, string | number | null | undefined>>,
    ) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      for (const [key, value] of Object.entries(newFilters)) {
        if (value === null || value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      }

      // If updating a filter other than page, reset page to 1
      if (!("page" in newFilters) && Object.keys(newFilters).length > 0) {
        current.delete("page");
      }

      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`);
    },
    [router, pathname, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}
