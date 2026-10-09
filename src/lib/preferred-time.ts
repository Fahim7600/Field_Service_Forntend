import { safeFormatDate } from "./format";

/**
 * Combines a calendar date (YYYY-MM-DD) and a time slot (HH:mm:ss) into an ISO-8601 string.
 */
export function combinePreferredAt(
  date: string,
  timeSlot = "09:00:00",
): string {
  if (!date) {
    return new Date().toISOString();
  }
  try {
    const cleanDate = date.split("T")[0];
    const cleanTime = timeSlot.includes(":") ? timeSlot : "09:00:00";
    const dateObj = new Date(`${cleanDate}T${cleanTime}`);
    if (Number.isNaN(dateObj.getTime())) {
      return new Date().toISOString();
    }
    return dateObj.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Parses an ISO-8601 string into a separate date (YYYY-MM-DD) and the closest matching TIME_SLOT_OPTIONS value.
 */
export function splitPreferredAt(isoString?: string | null): {
  date: string;
  timeSlot: string;
} {
  if (!isoString) {
    const today = new Date().toISOString().split("T")[0];
    return { date: today, timeSlot: "09:00:00" };
  }

  try {
    const dateObj = new Date(isoString);
    if (Number.isNaN(dateObj.getTime())) {
      return {
        date: new Date().toISOString().split("T")[0],
        timeSlot: "09:00:00",
      };
    }

    const date = safeFormatDate(
      isoString,
      "yyyy-MM-dd",
      new Date().toISOString().split("T")[0],
    );
    const hours = dateObj.getHours();

    // Map to closest preset slot: Morning (09:00:00), Afternoon (14:00:00), Evening (17:00:00)
    let timeSlot = "09:00:00";
    if (hours >= 16) {
      timeSlot = "17:00:00";
    } else if (hours >= 12) {
      timeSlot = "14:00:00";
    }

    return { date, timeSlot };
  } catch {
    return {
      date: new Date().toISOString().split("T")[0],
      timeSlot: "09:00:00",
    };
  }
}
