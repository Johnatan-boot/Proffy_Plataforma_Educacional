import { FastifyInstance } from "fastify";
import { TeacherController } from "./teacher.controller";
import { TeacherRepository } from "./teacher.repository";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "./teacher.schema";
import { TeacherService } from "./teacher.service";
import { UserRepository } from "../users/user.repository";
import { TeacherSubjectRepository } from "../teacher-subject/teacher-subject.repository";

export async function teacherRoutes(app: FastifyInstance) {
  const teacherRepository = new TeacherRepository();
  const userRepository = new UserRepository();
  const teacherSubjectRepository = new TeacherSubjectRepository();

  const teacherService = new TeacherService(
    teacherRepository,
    userRepository,
    teacherSubjectRepository,
  );

  const teacherController = new TeacherController(teacherService);

  app.post("/api/v1/teachers", async (request, reply) => {
    const result = createTeacherSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Invalid teacher data",
        issues: result.error.issues,
      });
    }

    return teacherController.create(
      {
        ...request,
        body: result.data,
      } as typeof request & {
        body: typeof result.data;
      },
      reply,
    );
  });

  app.get("/api/v1/teachers", async (request, reply) => {
    return teacherController.listAll(request, reply);
  });

  app.get("/api/v1/teachers/:id", async (request, reply) => {
    return teacherController.findByIdDetailed(
      request as typeof request & {
        params: { id: string };
      },
      reply,
    );
  });

  app.get("/api/v1/teachers/user/:userId", async (request, reply) => {
    return teacherController.findByUserId(
      request as typeof request & {
        params: { userId: string };
      },
      reply,
    );
  });

  app.patch("/api/v1/teachers/:id", async (request, reply) => {
    const result = updateTeacherSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Invalid teacher data",
        issues: result.error.issues,
      });
    }

    return teacherController.update(
      {
        ...request,
        body: result.data,
        params: request.params as { id: string },
      } as typeof request & {
        params: { id: string };
        body: typeof result.data;
      },
      reply,
    );
  });

  app.delete("/api/v1/teachers/:id", async (request, reply) => {
    return teacherController.delete(
      request as typeof request & {
        params: { id: string };
      },
      reply,
    );
  });
}