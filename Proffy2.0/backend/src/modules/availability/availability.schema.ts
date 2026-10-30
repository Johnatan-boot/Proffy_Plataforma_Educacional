import { z } from "zod";

export const createAvailabilitySchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),

  weekDay: z
    .number()
    .int()
    .min(0, "Week day must be between 0 and 6")
    .max(6, "Week day must be between 0 and 6"),

  from: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Invalid start time",
    ),

  to: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Invalid end time",
    ),
});

export const availabilityIdSchema = z.object({
  id: z.string().min(1, "Availability ID is required"),
});

export type CreateAvailabilityInput = z.infer<
  typeof createAvailabilitySchema
>;