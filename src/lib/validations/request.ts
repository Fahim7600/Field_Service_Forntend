import { z } from "zod";

export const step1Schema = z.object({
  categoryId: z.string().min(1, "Please select a service category"),
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
});

export const step2Schema = z.object({
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time window"),
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address cannot exceed 255 characters"),
});

export const step3Schema = z.object({
  attachments: z
    .array(z.string().url("Invalid attachment URL"))
    .max(5, "Maximum 5 attachments allowed"),
});

export const serviceRequestSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

export type ServiceRequestFormValues = z.infer<typeof serviceRequestSchema>;

export const TIME_SLOT_OPTIONS = [
  { label: "Morning (8:00 AM - 12:00 PM)", value: "09:00:00" },
  { label: "Afternoon (12:00 PM - 4:00 PM)", value: "14:00:00" },
  { label: "Evening (4:00 PM - 8:00 PM)", value: "17:00:00" },
] as const;
