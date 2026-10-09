import { z } from "zod";

import { toIsoFromLocalInput } from "@/lib/format";

export const visitWindowSchema = z
  .object({
    start: z.string().min(1, "Visit start time is required"),
    end: z.string().min(1, "Visit end time is required"),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.start);
      const now = new Date(Date.now() - 60000); // 1-minute grace for form filling
      return !Number.isNaN(startDate.getTime()) && startDate >= now;
    },
    {
      message: "Visit start time must be in the future",
      path: ["start"],
    },
  )
  .refine(
    (data) => {
      const startDate = new Date(data.start);
      const endDate = new Date(data.end);
      return (
        !Number.isNaN(startDate.getTime()) &&
        !Number.isNaN(endDate.getTime()) &&
        endDate > startDate
      );
    },
    {
      message: "Visit end time must be after the start time",
      path: ["end"],
    },
  )
  .refine(
    (data) => {
      const startDate = new Date(data.start);
      const endDate = new Date(data.end);
      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        return false;
      }
      const diffMs = endDate.getTime() - startDate.getTime();
      const maxMs = 12 * 60 * 60 * 1000; // 12 hours
      return diffMs <= maxMs;
    },
    {
      message: "Visit window duration cannot exceed 12 hours",
      path: ["end"],
    },
  );

export type VisitWindowValues = z.infer<typeof visitWindowSchema>;

/**
 * Converts local input values to ISO strings. Returns null if either input is invalid.
 */
export function windowToIso(
  values: VisitWindowValues,
): { startIso: string; endIso: string } | null {
  if (!values?.start || !values?.end) return null;
  const startIso = toIsoFromLocalInput(values.start);
  const endIso = toIsoFromLocalInput(values.end);
  if (!startIso || !endIso) return null;
  return { startIso, endIso };
}
