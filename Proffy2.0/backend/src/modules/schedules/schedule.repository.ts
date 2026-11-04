import { prisma } from "../../lib/prisma";

export class ScheduleRepository {
  async create(data: {
    teacherId: string;
    studentId: string;
    subjectId: string;
    room?: string;
    className?: string;
    scheduledAt: Date;
    duration: number;
  }) {
    return prisma.schedule.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.schedule.findUnique({
      where: {
        id,
      },
    });
  }

  async findAllWithDetails() {
    return prisma.schedule.findMany({
      include: {
        teacher: { include: { user: true } },
        student: { include: { user: true } },
        subject: true,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });
  }

  async findByTeacherId(teacherId: string) {
    return prisma.schedule.findMany({
      where: {
        teacherId,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });
  }

  async findByStudentId(studentId: string) {
    return prisma.schedule.findMany({
      where: {
        studentId,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });
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
    return prisma.schedule.update({
      where: { id },
      data,
    });
  }

  async findAllWithDetailsById(id: string) {
    return prisma.schedule.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: true } },
        student: { include: { user: true } },
        subject: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.schedule.delete({
      where: {
        id,
      },
    });
  }
}