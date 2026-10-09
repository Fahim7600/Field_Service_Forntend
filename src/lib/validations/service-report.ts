import { z } from "zod";
import type { PickedImage } from "@/components/forms/image-picker";

export const serviceReportSchema = z.object({
  workDone: z
    .string()
    .trim()
    .min(10, "Please describe the work done in at least 10 characters")
    .max(2000, "Work description cannot exceed 2000 characters"),
  partsUsed: z.string(),
  hoursSpent: z.coerce
    .number({
      invalid_type_error: "Please enter a valid number of hours",
    })
    .min(0.25, "Hours spent must be at least 0.25 (15 mins)")
    .max(24, "Hours spent cannot exceed 24 hours per visit"),
  photos: z
    .array(
      z.custom<PickedImage>(
        (val): val is PickedImage =>
          typeof val === "object" &&
          val !== null &&
          "file" in (val as Record<string, unknown>),
        { message: "Invalid photo attachment" },
      ),
    )
    .max(5, "Maximum 5 photos allowed"),
});

export type ServiceReportFormValues = z.infer<typeof serviceReportSchema>;
