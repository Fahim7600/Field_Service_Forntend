export interface CachedFeedback {
  rating: number;
  comment?: string | null;
  createdAt?: string;
}

/**
 * Persists submitted work order feedback to browser localStorage.
 * Wrapped in try/catch to safely handle private browsing / SSR environments.
 */
export function saveFeedback(
  userId: string | undefined | null,
  workOrderId: string,
  feedback: CachedFeedback,
): void {
  if (typeof window === "undefined") return;
  try {
    const key = `fs_feedback_${userId || "anon"}_${workOrderId}`;
    localStorage.setItem(key, JSON.stringify(feedback));
  } catch {
    // Gracefully ignore localStorage write errors
  }
}

/**
 * Loads cached work order feedback from browser localStorage.
 * Wrapped in try/catch and never throws.
 */
export function loadFeedback(
  userId: string | undefined | null,
  workOrderId: string,
): CachedFeedback | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `fs_feedback_${userId || "anon"}_${workOrderId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.rating === "number"
    ) {
      return parsed as CachedFeedback;
    }
    return null;
  } catch {
    return null;
  }
}
