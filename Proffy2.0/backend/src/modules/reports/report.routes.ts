import { FastifyInstance } from "fastify";
import { ReportService } from "./report.service";

export async function reportRoutes(app: FastifyInstance) {
  const reportService = new ReportService();

  app.get("/api/v1/reports/overview", async (_request, reply) => {
    return reply.code(200).send(await reportService.overview());
  });
}
