import { z } from "zod";

export const CONTACT_TOPICS = [
  "Booking question",
  "Billing or payment",
  "Technician or partnership",
  "Technical problem",
  "Other",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must not exceed 60 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  topic: z.enum(CONTACT_TOPICS, {
    errorMap: () => ({ message: "Please select a topic" }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must not exceed 1000 characters"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
