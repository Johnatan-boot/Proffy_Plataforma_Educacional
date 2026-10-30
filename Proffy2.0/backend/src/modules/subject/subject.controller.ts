import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../shared/errors/app-error";
import { CreateSubjectInput, UpdateSubjectInput } from "./subject.schema";
import { SubjectService } from "./subject.service";

export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  async listAll(_request: FastifyRequest, reply: FastifyReply) {
    const subjects = await this.subjectService.findAll();
    return reply.code(200).send(subjects);
  }

  async create(
    request: FastifyRequest<{ Body: CreateSubjectInput }>,
    reply: FastifyReply,
  ) {
    const subject = await this.subjectService.create(request.body);

    return reply.code(201).send(subject);
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const subject = await this.subjectService.findById(request.params.id);

    if (!subject) {
      throw new NotFoundError("Subject not found");
    }

    return reply.code(200).send(subject);
  }

  async findByName(
    request: FastifyRequest<{ Params: { name: string } }>,
    reply: FastifyReply,
  ) {
    const subject = await this.subjectService.findByName(
      request.params.name,
    );

    if (!subject) {
      throw new NotFoundError("Subject not found");
    }

    return reply.code(200).send(subject);
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await this.subjectService.delete(request.params.id);

    return reply.code(204).send();
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateSubjectInput;
    }>,
    reply: FastifyReply,
  ) {
    const subject = await this.subjectService.update(
      request.params.id,
      request.body,
    );

    return reply.code(200).send(subject);
  }
}