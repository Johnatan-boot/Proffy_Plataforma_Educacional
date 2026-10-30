import Fastify from "fastify";
import cors from "@fastify/cors";
import { userRoutes } from "./modules/users/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { teacherRoutes } from "./modules/teachers/teacher.routes";
import { studentRoutes } from "./modules/students/student.routes";
import { subjectRoutes } from "./modules/subject/subject.routes";
import { teacherSubjectRoutes } from "./modules/teacher-subject/teacher-subject.routes";
import { availabilityRoutes } from "./modules/availability/availability.routes";
import { scheduleRoutes } from "./modules/schedules/schedule.routes";
import { reportRoutes } from "./modules/reports/report.routes";
import { AppError } from "./shared/errors/app-error";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: (process.env.CORS_ORIGIN || "http://localhost:3001").split(","),
    // @fastify/cors só libera GET/HEAD/POST por padrão — sem isto o PATCH
    // (editar professor/aluno/disciplina) e o DELETE são bloqueados no preflight.
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

 app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      message: error.message,
    });
  }

  request.log.error(error);

  return reply.code(500).send({
    message: "Internal server error",
  });
});

  app.get("/api/v1/health", async () => {
    return {
      status: "ok",
    };
  });

  app.register(userRoutes);
  app.register(authRoutes);
  app.register(teacherRoutes);
  app.register(studentRoutes);
  app.register(subjectRoutes);
  app.register(teacherSubjectRoutes);
  app.register(availabilityRoutes);
  app.register(scheduleRoutes);
  app.register(reportRoutes);
  return app;
}
