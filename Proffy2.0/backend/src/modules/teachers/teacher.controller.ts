import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../shared/errors/app-error";
import {
  CreateTeacherInput,
  UpdateTeacherInput,
} from "./teacher.schema";
import { TeacherService } from "./teacher.service";
import { toTeacherResponse } from "./teacher.mapper";

export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  async listAll(_request: FastifyRequest, reply: FastifyReply) {
    const teachers = await this.teacherService.findAllWithDetails();
    return reply.code(200).send(teachers.map(toTeacherResponse));
  }

  async findByIdDetailed(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const teacher = await this.teacherService.findByIdWithDetails(
      request.params.id,
    );

    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }

    return reply.code(200).send(toTeacherResponse(teacher));
  }

  async create(
    request: FastifyRequest<{ Body: CreateTeacherInput }>,
    reply: FastifyReply,
  ) {
    const teacher = await this.teacherService.create(request.body);
    const detailed = await this.teacherService.findByIdWithDetails(teacher.id);

    return reply.code(201).send(detailed ? toTeacherResponse(detailed) : teacher);
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const teacher = await this.teacherService.findById(request.params.id);

    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }

    return reply.code(200).send(teacher);
  }

  async findByUserId(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
  ) {
    const teacher = await this.teacherService.findByUserId(
      request.params.userId,
    );

    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }

    return reply.code(200).send(teacher);
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateTeacherInput;
    }>,
    reply: FastifyReply,
  ) {
    await this.teacherService.update(request.params.id, request.body);
    const detailed = await this.teacherService.findByIdWithDetails(
      request.params.id,
    );

    return reply.code(200).send(detailed ? toTeacherResponse(detailed) : null);
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await this.teacherService.delete(request.params.id);

    return reply.code(204).send();
  }
}