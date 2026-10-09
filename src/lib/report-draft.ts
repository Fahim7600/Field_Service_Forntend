import type { ServiceReportFormValues } from "./validations/service-report";

const STORAGE_PREFIX = "field_service_report_draft_";

export interface ServiceReportDraftValues {
  workDone: string;
  partsUsed: string;
  hoursSpent: number;
  photos: string[];
  lastSavedAt: string;
}

/**
 * Safely saves the report form draft into sessionStorage.
 * Never throws exceptions if storage is blocked or full.
 */
export function saveDraft(
  workOrderId: string,
  values: ServiceReportFormValues,
): void {
  if (typeof window === "undefined" || !workOrderId) return;

  try {
    const draft: ServiceReportDraftValues = {
      workDone: values.workDone || "",
      partsUsed: values.partsUsed || "",
      hoursSpent: values.hoursSpent || 0,
      photos: Array.isArray(values.photos) ? values.photos : [],
      lastSavedAt: new Date().toISOString(),
    };
    window.sessionStorage.setItem(
      `${STORAGE_PREFIX}${workOrderId}`,
      JSON.stringify(draft),
    );
  } catch {
    // Gracefully ignore storage quota / access errors
  }
}

/**
 * Safely loads the report form draft from sessionStorage.
 * Returns null if no draft exists or if parsing fails.
 */
export function loadDraft(
  workOrderId: string,
): ServiceReportDraftValues | null {
  if (typeof window === "undefined" || !workOrderId) return null;

  try {
    const raw = window.sessionStorage.getItem(
      `${STORAGE_PREFIX}${workOrderId}`,
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "workDone" in parsed) {
      return parsed as ServiceReportDraftValues;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Clears the stored draft from sessionStorage.
 */
export function clearDraft(workOrderId: string): void {
  if (typeof window === "undefined" || !workOrderId) return;

  try {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${workOrderId}`);
  } catch {
    // Gracefully ignore
  }
}
