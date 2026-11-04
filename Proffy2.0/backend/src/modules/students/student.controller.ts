import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../shared/errors/app-error";
import { CreateStudentInput, UpdateStudentInput } from "./student.schema";
import { StudentService } from "./student.service";
import { toStudentResponse } from "./student.mapper";

export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  async create(
    request: FastifyRequest<{ Body: CreateStudentInput }>,
    reply: FastifyReply,
  ) {
    const student = await this.studentService.create(request.body);
    const detailed = await this.studentService.findByIdWithDetails(student.id);

    return reply.code(201).send(detailed ? toStudentResponse(detailed) : student);
  }

  async listAll(_request: FastifyRequest, reply: FastifyReply) {
    const students = await this.studentService.findAllWithDetails();
    return reply.code(200).send(students.map(toStudentResponse));
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const student = await this.studentService.findByIdWithDetails(
      request.params.id,
    );

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    return reply.code(200).send(toStudentResponse(student));
  }

  async findByUserId(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
  ) {
    const student = await this.studentService.findByUserId(
      request.params.userId,
    );

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    return reply.code(200).send(student);
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateStudentInput;
    }>,
    reply: FastifyReply,
  ) {
    const updated = await this.studentService.update(
      request.params.id,
      request.body,
    );

    return reply.code(200).send(updated ? toStudentResponse(updated) : null);
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await this.studentService.delete(request.params.id);

    return reply.code(204).send();
  }
}
