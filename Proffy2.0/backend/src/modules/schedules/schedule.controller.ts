import { FastifyReply, FastifyRequest } from "fastify";
import { ScheduleService } from "./schedule.service";
import {
  createScheduleSchema,
  updateScheduleSchema,
  scheduleIdSchema,
} from "./schedule.schema";
import { toScheduleEntryResponse } from "./schedule.mapper";

export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
  ) {}

  async listAll(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const schedules = await this.scheduleService.findAllWithDetails();
    return reply.code(200).send(schedules.map(toScheduleEntryResponse));
  }

  async create(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const result = createScheduleSchema.safeParse(
      request.body,
    );

    if (!result.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const schedule =
      await this.scheduleService.create(result.data);

    return reply.code(201).send(schedule);
  }

  async findById(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const result = scheduleIdSchema.safeParse(
      request.params,
    );

    if (!result.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const schedule =
      await this.scheduleService.findById(result.data.id);

    if (!schedule) {
      return reply.code(404).send({
        message: "Schedule not found",
      });
    }

    return reply.send(schedule);
  }

  async listByTeacher(
    request: FastifyRequest<{ Params: { teacherId: string } }>,
    reply: FastifyReply,
  ) {
    const schedules = await this.scheduleService.findByTeacherId(
      request.params.teacherId,
    );
    return reply.code(200).send(schedules);
  }

  async listByStudent(
    request: FastifyRequest<{ Params: { studentId: string } }>,
    reply: FastifyReply,
  ) {
    const schedules = await this.scheduleService.findByStudentId(
      request.params.studentId,
    );
    return reply.code(200).send(schedules);
  }

  async update(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = scheduleIdSchema.safeParse(request.params);

    if (!params.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: params.error.flatten().fieldErrors,
      });
    }

    const body = updateScheduleSchema.safeParse(request.body);

    if (!body.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: body.error.flatten().fieldErrors,
      });
    }

    const updated = await this.scheduleService.update(
      params.data.id,
      body.data,
    );

    return reply.code(200).send(updated ? toScheduleEntryResponse(updated) : null);
  }

  async delete(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const result = scheduleIdSchema.safeParse(
      request.params,
    );

    if (!result.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const schedule =
      await this.scheduleService.findById(result.data.id);

    if (!schedule) {
      return reply.code(404).send({
        message: "Schedule not found",
      });
    }

    await this.scheduleService.delete(result.data.id);

    return reply.code(204).send();
  }
}