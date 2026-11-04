import { z } from "zod";

export const createTeacherSchema = z.object({
  userId: z.string().min(1),
  bio: z.string().trim().min(10).max(1000),
  hourlyRate: z.number().positive(),
});

export const updateTeacherSchema = z
  .object({
    bio: z.string().trim().min(10).max(1000).optional(),
    hourlyRate: z.number().positive().optional(),
    name: z.string().trim().min(2).max(100).optional(),
    avatar: z.string().trim().url().optional(),
    whatsapp: z.string().trim().min(8).max(20).optional(),
    subjectId: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;