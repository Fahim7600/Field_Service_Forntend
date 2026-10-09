"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export interface UrlFilters {
  page: number;
  limit: number;
  status?: string;
  priority?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  search?: string;
  type?: string;
  [key: string]: unknown;
}

export function useUrlFilters(defaults?: Partial<UrlFilters>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<UrlFilters>(() => {
    const rawPage = searchParams.get("page");
    const rawLimit = searchParams.get("limit");
    const status = searchParams.get("status") || defaults?.status || undefined;
    const priority =
      searchParams.get("priority") || defaults?.priority || undefined;
    const sortBy = searchParams.get("sortBy") || defaults?.sortBy || undefined;
    const order =
      (searchParams.get("order") as "asc" | "desc") ||
      defaults?.order ||
      undefined;
    const search = searchParams.get("search") || defaults?.search || undefined;
    const type = searchParams.get("type") || defaults?.type || undefined;

    const page =
      rawPage && !Number.isNaN(Number(rawPage))
        ? Math.max(1, Number(rawPage))
        : (defaults?.page ?? 1);
    const limit =
      rawLimit && !Number.isNaN(Number(rawLimit))
        ? Math.max(1, Number(rawLimit))
        : (defaults?.limit ?? 10);

    const extra: Record<string, unknown> = {};
    for (const [k, v] of searchParams.entries()) {
      if (
        ![
          "page",
          "limit",
          "status",
          "priority",
          "sortBy",
          "order",
          "search",
          "type",
        ].includes(k)
      ) {
        extra[k] = v;
      }
    }

    return {
      page,
      limit,
      status,
      priority,
      sortBy,
      order,
      search,
      type,
      ...extra,
    };
  }, [searchParams, defaults]);

  const updateFilters = useCallback(
    (
      newFilters: Partial<Record<string, string | number | null | undefined>>,
      options?: { replace?: boolean; scroll?: boolean },
    ) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      const isOnlyPageChange =
        Object.keys(newFilters).length === 1 && "page" in newFilters;

      for (const [key, value] of Object.entries(newFilters)) {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          value === "ALL" ||
          (key === "page" && Number(value) === 1)
        ) {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      }

      // If updating any filter other than page, reset page to 1 (remove page from url)
      if (!isOnlyPageChange && Object.keys(newFilters).length > 0) {
        current.delete("page");
      }

      const search = current.toString();
      const query = search ? `?${search}` : "";
      const targetUrl = `${pathname}${query}`;

      if (isOnlyPageChange && !options?.replace) {
        router.push(targetUrl, { scroll: options?.scroll ?? true });
      } else {
        router.replace(targetUrl, { scroll: options?.scroll ?? false });
      }
    },
    [router, pathname, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}

/**
 * Hook to manage a debounced text search input synchronized with URL filters.
 */
export function useDebouncedSearchFilter(filterKey = "search", delay = 400) {
  const { filters, updateFilters } = useUrlFilters();
  const currentVal = (filters[filterKey] as string) || "";
  const [searchTerm, setSearchTerm] = useState(currentVal);
  const debouncedTerm = useDebounce(searchTerm, delay);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchTerm(currentVal);
  }, [currentVal]);

  // Push debounced update to URL
  useEffect(() => {
    if (debouncedTerm !== currentVal) {
      updateFilters({ [filterKey]: debouncedTerm || undefined });
    }
  }, [debouncedTerm, currentVal, filterKey, updateFilters]);

  return {
    searchTerm,
    setSearchTerm,
  };
}
