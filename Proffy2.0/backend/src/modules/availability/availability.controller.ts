import { FastifyReply, FastifyRequest } from "fastify";
import { AvailabilityRepository } from "./availability.repository";
import { AvailabilityService } from "./availability.service";
import { TeacherRepository } from "../teachers/teacher.repository";

const availabilityRepository = new AvailabilityRepository();
const teacherRepository = new TeacherRepository();

const availabilityService = new AvailabilityService(
  availabilityRepository,
  teacherRepository,
);

export class AvailabilityController {
  async create(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const availability = await availabilityService.create(
      request.body as {
        teacherId: string;
        weekDay: number;
        from: string;
        to: string;
      },
    );

    return reply.status(201).send(availability);
  }

  async findById(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { id } = request.params as {
      id: string;
    };

    const availability = await availabilityService.findById(id);

    if (!availability) {
      return reply.status(404).send({
        message: "Availability not found",
      });
    }

    return reply.status(200).send(availability);
  }

  async listByTeacher(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { teacherId } = request.params as {
      teacherId: string;
    };

    const availabilities = await availabilityService.findByTeacherId(
      teacherId,
    );

    return reply.status(200).send(availabilities);
  }

  async delete(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { id } = request.params as {
      id: string;
    };

    const availability = await availabilityService.findById(id);

    if (!availability) {
      return reply.status(404).send({
        message: "Availability not found",
      });
    }

    await availabilityService.delete(id);

    return reply.status(204).send();
  }
}