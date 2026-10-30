import { ScheduleRepository } from "./schedule.repository";
import {
  AppError,
  NotFoundError,
} from "../../shared/errors/app-error";
import { TeacherRepository } from "../teachers/teacher.repository";
import { StudentRepository } from "../students/student.repository";
import { SubjectRepository } from "../subject/subject.repository";

export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly teacherRepository: TeacherRepository,
    private readonly studentRepository: StudentRepository,
    private readonly subjectRepository?: SubjectRepository,
  ) {}

  async create(data: {
    teacherId: string;
    studentId: string;
    subjectId: string;
    room?: string;
    className?: string;
    scheduledAt: Date;
    duration: number;
  }) {
    if (data.duration <= 0) {
      throw new AppError("Invalid schedule duration", 400);
    }

    const teacher = await this.teacherRepository.findById(
      data.teacherId,
    );

    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }

    const student = await this.studentRepository.findById(
      data.studentId,
    );

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    if (this.subjectRepository) {
      const subject = await this.subjectRepository.findById(
        data.subjectId,
      );

      if (!subject) {
        throw new NotFoundError("Subject not found");
      }
    }

    await this.assertNoConflict({
      teacherId: data.teacherId,
      studentId: data.studentId,
      scheduledAt: data.scheduledAt,
      duration: data.duration,
    });

    return this.scheduleRepository.create(data);
  }

  private async assertNoConflict(params: {
    teacherId: string;
    studentId: string;
    scheduledAt: Date;
    duration: number;
    ignoreId?: string;
  }) {
    const newStart = params.scheduledAt;
    const newEnd = new Date(newStart.getTime() + params.duration * 60 * 1000);

    const overlaps = (schedule: {
      id: string;
      status: string;
      scheduledAt: Date;
      duration: number;
    }) => {
      if (schedule.id === params.ignoreId) return false;
      if (schedule.status === "CANCELLED") return false;

      const existingStart = schedule.scheduledAt;
      const existingEnd = new Date(
        existingStart.getTime() + schedule.duration * 60 * 1000,
      );

      return existingStart < newEnd && existingEnd > newStart;
    };

    const teacherSchedules = await this.scheduleRepository.findByTeacherId(
      params.teacherId,
    );

    if (teacherSchedules.some(overlaps)) {
      throw new AppError(
        "Teacher already has a schedule in this time range",
        409,
      );
    }

    const studentSchedules = await this.scheduleRepository.findByStudentId(
      params.studentId,
    );

    if (studentSchedules.some(overlaps)) {
      throw new AppError(
        "Student already has a schedule in this time range",
        409,
      );
    }
  }

  async update(
    id: string,
    data: {
      teacherId?: string;
      studentId?: string;
      subjectId?: string;
      room?: string;
      className?: string;
      scheduledAt?: Date;
      duration?: number;
      status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    },
  ) {
    const current = await this.scheduleRepository.findById(id);

    if (!current) {
      throw new NotFoundError("Schedule not found");
    }

    if (data.teacherId && data.teacherId !== current.teacherId) {
      const teacher = await this.teacherRepository.findById(data.teacherId);
      if (!teacher) throw new NotFoundError("Teacher not found");
    }

    if (data.studentId && data.studentId !== current.studentId) {
      const student = await this.studentRepository.findById(data.studentId);
      if (!student) throw new NotFoundError("Student not found");
    }

    if (
      data.subjectId &&
      data.subjectId !== current.subjectId &&
      this.subjectRepository
    ) {
      const subject = await this.subjectRepository.findById(data.subjectId);
      if (!subject) throw new NotFoundError("Subject not found");
    }

    const nextStatus = data.status ?? current.status;
    const timeOrPeopleChanged =
      data.teacherId !== undefined ||
      data.studentId !== undefined ||
      data.scheduledAt !== undefined ||
      data.duration !== undefined;

    // Só revalida conflito se a aula continua ativa e algo que afeta o
    // horário/pessoas mudou (ou se está sendo reativada a partir de CANCELLED).
    if (
      nextStatus !== "CANCELLED" &&
      (timeOrPeopleChanged || current.status === "CANCELLED")
    ) {
      await this.assertNoConflict({
        teacherId: data.teacherId ?? current.teacherId,
        studentId: data.studentId ?? current.studentId,
        scheduledAt: data.scheduledAt ?? current.scheduledAt,
        duration: data.duration ?? current.duration,
        ignoreId: id,
      });
    }

    await this.scheduleRepository.update(id, data);

    return this.scheduleRepository.findAllWithDetailsById(id);
  }

  async findById(id: string) {
    return this.scheduleRepository.findById(id);
  }

  async findAllWithDetails() {
    return this.scheduleRepository.findAllWithDetails();
  }

  async findByTeacherId(teacherId: string) {
    return this.scheduleRepository.findByTeacherId(teacherId);
  }

  async findByStudentId(studentId: string) {
    return this.scheduleRepository.findByStudentId(studentId);
  }

  async delete(id: string) {
    return this.scheduleRepository.delete(id);
  }
}