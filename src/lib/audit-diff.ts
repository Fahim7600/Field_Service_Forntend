import { formatMoney } from "@/lib/format";

const SENSITIVE_KEY_REGEX = /password|token|secret|hash|authorization/i;

/**
 * Deeply masks sensitive keys in an object or array.
 * Keys matching /password|token|secret|hash|authorization/i will have their values replaced by "hidden".
 */
export function maskSensitive(
  values: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return null;
  }

  function maskValue(val: unknown): unknown {
    if (val === null || val === undefined) {
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(maskValue);
    }
    if (typeof val === "object") {
      const obj = val as Record<string, unknown>;
      const copy: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (SENSITIVE_KEY_REGEX.test(k)) {
          copy[k] = "hidden";
        } else {
          copy[k] = maskValue(v);
        }
      }
      return copy;
    }
    return val;
  }

  const result = maskValue(values) as Record<string, unknown>;
  return result;
}

/**
 * Formats a single value into a short human-readable string for diff display.
 */
function formatDiffValue(field: string, val: unknown): string {
  if (val === null || val === undefined || val === "") {
    return "empty";
  }

  // If the field name ends with 'Cents' and value is a number
  if (field.endsWith("Cents") && typeof val === "number") {
    return formatMoney(val);
  }

  if (typeof val === "string") {
    return val;
  }

  if (typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }

  if (typeof val === "object") {
    try {
      const str = JSON.stringify(val);
      if (str.length > 80) {
        return `${str.slice(0, 77)}...`;
      }
      return str;
    } catch {
      return "[Object]";
    }
  }

  return String(val);
}

export interface ValueDiff {
  field: string;
  from: string;
  to: string;
}

/**
 * Computes the readable differences between oldValues and newValues objects.
 * Returns an array of { field, from, to } where values differ.
 */
export function diffValues(
  oldValues: Record<string, unknown> | null | undefined,
  newValues: Record<string, unknown> | null | undefined,
): ValueDiff[] {
  const oldObj = oldValues && typeof oldValues === "object" ? oldValues : {};
  const newObj = newValues && typeof newValues === "object" ? newValues : {};

  const allKeys = Array.from(
    new Set([...Object.keys(oldObj), ...Object.keys(newObj)]),
  );

  if (allKeys.length === 0) {
    return [];
  }

  const diffs: ValueDiff[] = [];

  for (const key of allKeys) {
    const fromVal = oldObj[key];
    const toVal = newObj[key];

    // Compare values
    const isFromEmpty = fromVal === undefined || fromVal === null;
    const isToEmpty = toVal === undefined || toVal === null;

    if (isFromEmpty && isToEmpty) {
      continue;
    }

    let isDifferent = false;
    if (typeof fromVal === "object" || typeof toVal === "object") {
      try {
        isDifferent = JSON.stringify(fromVal) !== JSON.stringify(toVal);
      } catch {
        isDifferent = fromVal !== toVal;
      }
    } else {
      isDifferent = fromVal !== toVal;
    }

    if (isDifferent) {
      diffs.push({
        field: key,
        from: formatDiffValue(key, fromVal),
        to: formatDiffValue(key, toVal),
      });
    }
  }

  return diffs;
}
