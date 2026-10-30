import { z } from "zod";

export const createTeacherSubjectSchema = z.object({
  teacherId: z.string().trim().min(1),
  subjectId: z.string().trim().min(1),
});

export type CreateTeacherSubjectInput = z.infer<
  typeof createTeacherSubjectSchema
>;
