import type { PaginationMeta } from "@/types/api";

export interface NormalizedPaginated<T> {
  success: boolean;
  message: string;
  items: T[];
  data: T[];
  pagination: PaginationMeta;
  meta: PaginationMeta;
  extra?: Record<string, unknown>;
}

/**
 * Defensively extracts an array from any API response structure.
 * Handles:
 * - Direct arrays: `[item, item]`
 * - Standard PaginatedResponse: `{ success: true, data: [item, item] }`
 * - Object data with items: `{ success: true, data: { items: [item, item] } }`
 * - Nested resource objects: `{ success: true, data: { workOrders: [item] } }`
 * - Root resource objects: `{ workOrders: [item] }` or `{ items: [item] }`
 */
export function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const obj = payload as Record<string, unknown>;

  // Check `obj.data`
  if (Array.isArray(obj.data)) {
    return obj.data as T[];
  }

  // Check nested in `obj.data`
  if (obj.data && typeof obj.data === "object") {
    const nested = obj.data as Record<string, unknown>;
    const candidates = [
      "items",
      "categories",
      "services",
      "skills",
      "technicians",
      "workOrders",
      "tasks",
      "requests",
      "invoices",
      "users",
      "plans",
      "data",
      "results",
    ];
    for (const key of candidates) {
      if (Array.isArray(nested[key])) {
        return nested[key] as T[];
      }
    }
  }

  // Check root keys
  const rootCandidates = [
    "items",
    "categories",
    "services",
    "skills",
    "technicians",
    "workOrders",
    "tasks",
    "requests",
    "invoices",
    "users",
    "plans",
    "results",
  ];
  for (const key of rootCandidates) {
    if (Array.isArray(obj[key])) {
      return obj[key] as T[];
    }
  }

  return [];
}

/**
 * Tolerantly normalizes paginated list responses from both backend formats:
 * (Shape A): body.data is an array and body.pagination (or body.meta) holds the numbers.
 * (Shape B): body.data is an object with { items: [...], total, page, limit }.
 *
 * Guarantees both .items and .data point to the array, and both .pagination and .meta
 * point to the complete pagination metadata. Never throws or divides by zero.
 */
export function normalizePaginated<T>(body: unknown): NormalizedPaginated<T> {
  const isObj = Boolean(body && typeof body === "object");
  const raw = isObj ? (body as Record<string, unknown>) : {};

  // Find data object if present
  const dataField = raw.data;
  const isDataObj = Boolean(
    dataField && typeof dataField === "object" && !Array.isArray(dataField),
  );
  const dataObj = isDataObj ? (dataField as Record<string, unknown>) : {};

  // Extract array of items
  let items: T[] = [];
  if (isDataObj && Array.isArray(dataObj.items)) {
    items = dataObj.items as T[];
  } else if (Array.isArray(dataField)) {
    items = dataField as T[];
  } else if (Array.isArray(raw.items)) {
    items = raw.items as T[];
  } else {
    items = extractArray<T>(body);
  }

  // Find pagination containers
  const topPagination = (
    raw.pagination && typeof raw.pagination === "object"
      ? raw.pagination
      : raw.meta && typeof raw.meta === "object"
        ? raw.meta
        : {}
  ) as Record<string, unknown>;

  // Parse page
  const rawPage = dataObj.page ?? topPagination.page ?? raw.page ?? 1;
  const page = Math.max(1, Number(rawPage) || 1);

  // Parse limit
  const rawLimit =
    dataObj.limit ??
    topPagination.limit ??
    raw.limit ??
    (items.length > 0 ? items.length : 10);
  const limit = Math.max(1, Number(rawLimit) || 10);

  // Parse total
  const rawTotal =
    dataObj.total ?? topPagination.total ?? raw.total ?? items.length;
  const total = Math.max(0, Number(rawTotal) || 0);

  // Parse or compute totalPages safely without division by zero
  const rawTotalPages =
    dataObj.totalPages ?? topPagination.totalPages ?? raw.totalPages;
  const totalPages =
    rawTotalPages !== undefined &&
    rawTotalPages !== null &&
    !Number.isNaN(Number(rawTotalPages))
      ? Math.max(1, Number(rawTotalPages))
      : Math.max(1, Math.ceil(total / limit));

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
  };

  // Extract extra object (e.g. { unreadCount })
  const extra = (
    raw.extra && typeof raw.extra === "object"
      ? raw.extra
      : dataObj.extra && typeof dataObj.extra === "object"
        ? dataObj.extra
        : undefined
  ) as Record<string, unknown> | undefined;

  const success = typeof raw.success === "boolean" ? raw.success : true;
  const message = typeof raw.message === "string" ? raw.message : "Success";

  return {
    success,
    message,
    items,
    data: items,
    pagination: meta,
    meta,
    extra,
  };
}
