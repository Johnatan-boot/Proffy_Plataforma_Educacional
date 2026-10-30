import { NotFoundError } from "../../shared/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserInput, UpdateUserInput } from "./user.schema";
import { UserService } from "./user.service";
import { toUserResponse } from "./user.mapper";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply,
  ) {
    const user = await this.userService.create(request.body);

    return reply.code(201).send(toUserResponse(user));
  }
  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const user = await this.userService.findById(request.params.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return reply.code(200).send(toUserResponse(user));
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateUserInput;
    }>,
    reply: FastifyReply,
  ) {
    const user = await this.userService.findById(request.params.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedUser = await this.userService.update(
      request.params.id,
      request.body,
    );

    return reply.code(200).send(toUserResponse(updatedUser));
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const user = await this.userService.findById(request.params.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.userService.delete(request.params.id);

    return reply.code(204).send();
  }
}
