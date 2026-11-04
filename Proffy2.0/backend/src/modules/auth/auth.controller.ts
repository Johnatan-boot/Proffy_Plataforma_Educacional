import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { RegisterInput, LoginInput } from "./auth.schema";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply,
  ) {
    const result = await this.authService.register(request.body);
    return reply.code(201).send(result);
  }

  async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply,
  ) {
    const result = await this.authService.login(request.body);
    return reply.code(200).send(result);
  }
}
