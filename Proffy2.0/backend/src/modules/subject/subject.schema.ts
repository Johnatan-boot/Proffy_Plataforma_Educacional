import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const updateSubjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;