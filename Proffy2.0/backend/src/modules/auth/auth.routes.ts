import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "../users/user.repository";
import { TeacherRepository } from "../teachers/teacher.repository";
import { StudentRepository } from "../students/student.repository";
import { TeacherSubjectRepository } from "../teacher-subject/teacher-subject.repository";
import { registerSchema, loginSchema } from "./auth.schema";

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(
    new UserRepository(),
    new TeacherRepository(),
    new StudentRepository(),
    new TeacherSubjectRepository(),
  );

  const authController = new AuthController(authService);

  app.post("/api/v1/auth/register", async (request, reply) => {
    const result = registerSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    return authController.register(
      { ...request, body: result.data } as typeof request & {
        body: typeof result.data;
      },
      reply,
    );
  });

  app.post("/api/v1/auth/login", async (request, reply) => {
    const result = loginSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    return authController.login(
      { ...request, body: result.data } as typeof request & {
        body: typeof result.data;
      },
      reply,
    );
  });
}
