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

  app.setErrorHandler((error: any, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        message: error.message,
      });
    }

    // Erros conhecidos do Prisma viram respostas claras (antes tudo virava 500
    // "Internal server error", sem dar pista do que aconteceu).
    const prismaMessages: Record<string, [number, string]> = {
      P2025: [404, "Registro não encontrado."],
      P2003: [409, "Não é possível concluir: o registro está em uso por outros dados."],
      P2002: [409, "Já existe um registro com esses dados."],
    };

    const known = typeof error?.code === "string" ? prismaMessages[error.code] : undefined;

    if (known) {
      request.log.warn({ code: error.code }, "prisma known error");
      return reply.code(known[0]).send({ message: known[1], code: error.code });
    }

    if (/database is locked|SQLITE_BUSY/i.test(String(error?.message))) {
      request.log.error(error);
      return reply.code(503).send({
        message: "Banco de dados ocupado. Feche outros programas que usam o banco (ex.: Prisma Studio) e tente novamente.",
      });
    }

    request.log.error(error);

    return reply.code(500).send({
      message: "Internal server error",
      // Em desenvolvimento devolve o motivo real para facilitar o diagnóstico.
      ...(process.env.NODE_ENV !== "production" && {
        detail: String(error?.message ?? error).slice(0, 300),
      }),
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
