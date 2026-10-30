import { AvailabilityRepository } from "./availability.repository";
import {
  AppError,
  NotFoundError,
} from "../../shared/errors/app-error";
import { TeacherRepository } from "../teachers/teacher.repository";

export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly teacherRepository: TeacherRepository,
  ) {}

  async create(data: {
    teacherId: string;
    weekDay: number;
    from: string;
    to: string;
  }) {
    if (data.from >= data.to) {
     throw new AppError("Invalid availability time range", 400);
    }

    const teacher = await this.teacherRepository.findById(data.teacherId);

    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }

    return this.availabilityRepository.create(data);
  }

  async findById(id: string) {
    return this.availabilityRepository.findById(id);
  }

  async findByTeacherId(teacherId: string) {
    return this.availabilityRepository.findByTeacherId(teacherId);
  }

  async delete(id: string) {
    return this.availabilityRepository.delete(id);
  }
}