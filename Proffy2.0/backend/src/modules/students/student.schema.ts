import { z } from "zod";

export const createStudentSchema = z.object({
  userId: z.string().min(1),
});

export const updateStudentSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
    avatar: z.string().trim().url().optional(),
    whatsapp: z.string().trim().min(8).max(20).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;