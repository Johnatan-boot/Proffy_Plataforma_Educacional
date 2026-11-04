import { FastifyInstance } from "fastify";
import { AvailabilityController } from "./availability.controller";

const availabilityController = new AvailabilityController();

export async function availabilityRoutes(app: FastifyInstance) {
  app.post(
    "/api/v1/availabilities",
    availabilityController.create.bind(availabilityController),
  );

  app.get(
    "/api/v1/availabilities/teacher/:teacherId",
    availabilityController.listByTeacher.bind(availabilityController),
  );

  app.get(
    "/api/v1/availabilities/:id",
    availabilityController.findById.bind(availabilityController),
  );

  app.delete(
    "/api/v1/availabilities/:id",
    availabilityController.delete.bind(availabilityController),
  );
}