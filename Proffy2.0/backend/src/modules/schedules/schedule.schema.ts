import { z } from "zod";

export const createScheduleSchema = z.object({
  teacherId: z
    .string()
    .min(1, "Teacher ID is required"),

  studentId: z
    .string()
    .min(1, "Student ID is required"),

  subjectId: z
    .string()
    .min(1, "Subject ID is required"),

  room: z.string().trim().max(100).optional(),

  className: z.string().trim().max(100).optional(),

  scheduledAt: z
    .string()
    .datetime({
      message: "Invalid scheduled date",
    })
    .transform((value) => new Date(value)),

  duration: z
    .number()
    .int("Duration must be an integer")
    .positive("Duration must be greater than zero"),
});

export const updateScheduleSchema = z
  .object({
    teacherId: z.string().min(1).optional(),
    studentId: z.string().min(1).optional(),
    subjectId: z.string().min(1).optional(),
    room: z.string().trim().max(100).optional(),
    className: z.string().trim().max(100).optional(),
    scheduledAt: z
      .string()
      .datetime({ message: "Invalid scheduled date" })
      .transform((value) => new Date(value))
      .optional(),
    duration: z.number().int().positive().optional(),
    status: z
      .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export const scheduleIdSchema = z.object({
  id: z
    .string()
    .min(1, "Schedule ID is required"),
});

export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export type CreateScheduleInput = z.infer<
  typeof createScheduleSchema
>;