import { FastifyInstance } from "fastify";
import { StudentController } from "./student.controller";
import { createStudentSchema, updateStudentSchema } from "./student.schema";
import { StudentRepository } from "./student.repository";
import { StudentService } from "./student.service";
import { UserRepository } from "../users/user.repository";

export async function studentRoutes(app: FastifyInstance) {
  const studentRepository = new StudentRepository();
  const userRepository = new UserRepository();

  const studentService = new StudentService(
    studentRepository,
    userRepository,
  );

  const studentController = new StudentController(studentService);

  app.post("/api/v1/students", async (request, reply) => {
    const result = createStudentSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    return studentController.create(
      request as typeof request & { body: typeof result.data },
      reply,
    );
  });

  app.get("/api/v1/students", async (request, reply) => {
    return studentController.listAll(request, reply);
  });

  app.get<{ Params: { id: string } }>(
    "/api/v1/students/:id",
    async (request, reply) => {
      return studentController.findById(request, reply);
    },
  );

  app.patch<{ Params: { id: string } }>(
    "/api/v1/students/:id",
    async (request, reply) => {
      const result = updateStudentSchema.safeParse(request.body);

      if (!result.success) {
        return reply.code(400).send({
          message: "Validation error",
          errors: result.error.flatten(),
        });
      }

      return studentController.update(
        {
          ...request,
          body: result.data,
        } as typeof request & { params: { id: string }; body: typeof result.data },
        reply,
      );
    },
  );

  app.get<{ Params: { userId: string } }>(
    "/api/v1/students/user/:userId",
    async (request, reply) => {
      return studentController.findByUserId(request, reply);
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/api/v1/students/:id",
    async (request, reply) => {
      return studentController.delete(request, reply);
    },
  );
}