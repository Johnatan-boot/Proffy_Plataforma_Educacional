import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../shared/errors/app-error";
import {
  CreateTeacherSubjectInput,
} from "./teacher-subject.schema";
import { TeacherSubjectService } from "./teacher-subject.service";

export class TeacherSubjectController {
  constructor(
    private readonly teacherSubjectService: TeacherSubjectService,
  ) {}

  async create(
    request: FastifyRequest<{
      Body: CreateTeacherSubjectInput;
    }>,
    reply: FastifyReply,
  ) {
    const teacherSubject =
      await this.teacherSubjectService.create(request.body);

    return reply.code(201).send(teacherSubject);
  }

  async findById(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    const teacherSubject =
      await this.teacherSubjectService.findById(request.params.id);

    if (!teacherSubject) {
      throw new NotFoundError("TeacherSubject not found");
    }

    return reply.code(200).send(teacherSubject);
  }

  async delete(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    await this.teacherSubjectService.delete(request.params.id);

    return reply.code(204).send();
  }
}
