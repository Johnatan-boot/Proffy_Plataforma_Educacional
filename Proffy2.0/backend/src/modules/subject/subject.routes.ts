import { FastifyInstance } from "fastify";
import { SubjectController } from "./subject.controller";
import { createSubjectSchema, updateSubjectSchema } from "./subject.schema";
import { SubjectRepository } from "./subject.repository";
import { SubjectService } from "./subject.service";

export async function subjectRoutes(app: FastifyInstance) {
  const subjectRepository = new SubjectRepository();
  const subjectService = new SubjectService(subjectRepository);
  const subjectController = new SubjectController(subjectService);

  app.post("/api/v1/subjects", async (request, reply) => {
    const result = createSubjectSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    return subjectController.create(
      request as typeof request & { body: typeof result.data },
      reply,
    );
  });

  app.get("/api/v1/subjects", async (request, reply) => {
    return subjectController.listAll(request, reply);
  });

  app.get<{ Params: { id: string } }>(
    "/api/v1/subjects/:id",
    async (request, reply) => {
      return subjectController.findById(request, reply);
    },
  );

  app.get<{ Params: { name: string } }>(
    "/api/v1/subjects/name/:name",
    async (request, reply) => {
      return subjectController.findByName(request, reply);
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/api/v1/subjects/:id",
    async (request, reply) => {
      return subjectController.delete(request, reply);
    },
  );

  app.patch<{ Params: { id: string } }>(
    "/api/v1/subjects/:id",
    async (request, reply) => {
      const result = updateSubjectSchema.safeParse(request.body);

      if (!result.success) {
        return reply.code(400).send({
          message: "Validation error",
          errors: result.error.flatten(),
        });
      }

      return subjectController.update(
        {
          ...request,
          body: result.data,
        } as typeof request & { params: { id: string }; body: typeof result.data },
        reply,
      );
    },
  );
}