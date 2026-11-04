import { FastifyInstance } from "fastify";
import { UserController } from "./user.controller";
import { UserRepository } from "./user.repository";
import {
  createUserSchema,
  updateUserSchema,
} from "./user.schema";
import { UserService } from "./user.service";

export async function userRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  app.post("/api/v1/users", async (request, reply) => {
    const result = createUserSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Invalid user data",
        issues: result.error.issues,
      });
    }

    return userController.create(
      {
        ...request,
        body: result.data,
      } as typeof request & {
        body: typeof result.data;
      },
      reply,
    );
  });

  app.get("/api/v1/users/:id", async (request, reply) => {
    return userController.findById(
      request as typeof request & {
        params: { id: string };
      },
      reply,
    );
  });

  app.patch("/api/v1/users/:id", async (request, reply) => {
    const result = updateUserSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Invalid user data",
        issues: result.error.issues,
      });
    }

    return userController.update(
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

  app.delete("/api/v1/users/:id", async (request, reply) => {
    return userController.delete(
      request as typeof request & {
        params: { id: string };
      },
      reply,
    );
  });
}
