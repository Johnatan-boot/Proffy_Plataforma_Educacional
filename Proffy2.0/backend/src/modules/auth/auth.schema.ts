import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    role: z.enum(["TEACHER", "STUDENT", "ADMIN"]),
    avatar: z.string().trim().url().optional(),
    whatsapp: z.string().trim().min(8).max(20).optional(),
    bio: z.string().trim().min(10).max(1000).optional(),
    hourlyRate: z.number().positive().optional(),
    subjectId: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) => data.role !== "TEACHER" || (!!data.bio && !!data.hourlyRate),
    {
      message: "bio e hourlyRate são obrigatórios para professores",
      path: ["bio"],
    },
  );

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
