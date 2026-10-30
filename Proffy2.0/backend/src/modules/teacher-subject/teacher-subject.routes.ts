import { FastifyInstance } from "fastify";
import { SubjectRepository } from "../subject/subject.repository";
import { TeacherRepository } from "../teachers/teacher.repository";
import { TeacherSubjectController } from "./teacher-subject.controller";
import {
  createTeacherSubjectSchema,
} from "./teacher-subject.schema";
import { TeacherSubjectRepository } from "./teacher-subject.repository";
import { TeacherSubjectService } from "./teacher-subject.service";

export async function teacherSubjectRoutes(app: FastifyInstance) {
  const teacherSubjectRepository = new TeacherSubjectRepository();
  const teacherRepository = new TeacherRepository();
  const subjectRepository = new SubjectRepository();

  const teacherSubjectService = new TeacherSubjectService(
    teacherSubjectRepository,
    teacherRepository,
    subjectRepository,
  );

  const teacherSubjectController =
    new TeacherSubjectController(teacherSubjectService);

  app.post("/api/v1/teacher-subjects", async (request, reply) => {
    const result = createTeacherSubjectSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    return teacherSubjectController.create(
      request as typeof request & { body: typeof result.data },
      reply,
    );
  });

  app.get<{ Params: { id: string } }>(
    "/api/v1/teacher-subjects/:id",
    async (request, reply) => {
      return teacherSubjectController.findById(request, reply);
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/api/v1/teacher-subjects/:id",
    async (request, reply) => {
      return teacherSubjectController.delete(request, reply);
    },
  );
}
