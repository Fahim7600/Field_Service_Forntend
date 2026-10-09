export interface ServiceReportDraftValues {
  workDone: string;
  partsUsed: string;
  hoursSpent: number;
  lastSavedAt: string;
}

const STORAGE_PREFIX = "field_service_report_draft_";

/**
 * Safely saves text fields of the report form draft into sessionStorage.
 * File attachments are not saved in sessionStorage.
 */
export function saveDraft(
  workOrderId: string,
  values: {
    workDone?: string;
    partsUsed?: string;
    hoursSpent?: number;
  },
): void {
  if (typeof window === "undefined" || !workOrderId) return;

  try {
    const draft: ServiceReportDraftValues = {
      workDone: values.workDone || "",
      partsUsed: values.partsUsed || "",
      hoursSpent: values.hoursSpent || 1,
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
