/**
 * Defensively extracts an array from any API response structure.
 * Handles:
 * - Direct arrays: `[item, item]`
 * - Standard PaginatedResponse: `{ success: true, data: [item, item] }`
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
      "workOrders",
      "items",
      "tasks",
      "requests",
      "invoices",
      "users",
      "plans",
      "data",
    ];
    for (const key of candidates) {
      if (Array.isArray(nested[key])) {
        return nested[key] as T[];
      }
    }
  }

  // Check root keys
  const rootCandidates = [
    "workOrders",
    "items",
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
