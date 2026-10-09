import { z } from "zod";

// Phone regex (allowing E.164, US, and international formats with 7 to 15 digits)
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

export const accountDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name cannot exceed 60 characters"),
  email: z.string().email("Invalid email address").optional(),
  phone: z
    .string()
    .trim()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Please enter a valid phone number (e.g. +1234567890)",
    })
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(200, "Address cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
});

export type AccountDetailsFormValues = z.infer<typeof accountDetailsSchema>;

const timeSlotRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const dayWorkingHoursSchema = z
  .object({
    enabled: z.boolean(),
    start: z.string().regex(timeSlotRegex, "Must be in HH:mm format"),
    end: z.string().regex(timeSlotRegex, "Must be in HH:mm format"),
  })
  .refine(
    (data) => {
      if (!data.enabled) return true;
      return data.start < data.end;
    },
    {
      message: "End time must be later than start time",
      path: ["end"],
    },
  );

export const technicianProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(1000, "Bio cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  serviceArea: z
    .string()
    .trim()
    .max(100, "Service area cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  workingHours: z.object({
    monday: dayWorkingHoursSchema,
    tuesday: dayWorkingHoursSchema,
    wednesday: dayWorkingHoursSchema,
    thursday: dayWorkingHoursSchema,
    friday: dayWorkingHoursSchema,
    saturday: dayWorkingHoursSchema,
    sunday: dayWorkingHoursSchema,
  }),
});

export type TechnicianProfileFormValues = z.infer<
  typeof technicianProfileSchema
>;
