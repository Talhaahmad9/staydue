import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
});

export const phoneSchema = z.object({
  phone: z.string().regex(/^\+92[0-9]{10}$/, "Invalid Pakistani phone number"),
});

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().regex(/^\+92[0-9]{10}$/, "Invalid Pakistani phone number").optional()
);

export const calendarUrlSchema = z.object({
  url: z
    .string()
    .url()
    .startsWith("https://lms.iobm.edu.pk/moodle/calendar/export_execute.php"),
});

export const admissionYearSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{4}$/, "Admission year must look like 2022-2023.");

export const connectCalendarSchema = z.object({
  url: calendarUrlSchema.shape.url,
  phone: optionalPhoneSchema,
  admissionYear: admissionYearSchema,
});

export const registerInputSchema = signupSchema;
