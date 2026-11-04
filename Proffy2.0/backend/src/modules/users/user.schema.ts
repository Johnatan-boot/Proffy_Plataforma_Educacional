import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  passwordHash: z.string().min(1),
  role: z.enum(["TEACHER", "STUDENT", "ADMIN"]),
  avatar: z.string().trim().url().optional(),
  whatsapp: z.string().trim().min(8).max(20).optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
    passwordHash: z.string().min(1).optional(),
    role: z.enum(["TEACHER", "STUDENT", "ADMIN"]).optional(),
    avatar: z.string().trim().url().optional(),
    whatsapp: z.string().trim().min(8).max(20).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
