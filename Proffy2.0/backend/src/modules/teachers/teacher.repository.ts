import { prisma } from "../../lib/prisma";

export class TeacherRepository {
  async create(data: {
    userId: string;
    bio: string;
    hourlyRate: number;
  }) {
    return prisma.teacher.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.teacher.findUnique({
      where: {
        id,
      },
    });
  }

  async findAllWithDetails() {
    return prisma.teacher.findMany({
      include: {
        user: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        availabilities: {
          orderBy: [{ weekDay: "asc" }, { from: "asc" }],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByIdWithDetails(id: string) {
    return prisma.teacher.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        availabilities: {
          orderBy: [{ weekDay: "asc" }, { from: "asc" }],
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.teacher.findUnique({
      where: {
        userId,
      },
    });
  }

  async update(
    id: string,
    data: {
      bio?: string;
      hourlyRate?: number;
    },
  ) {
    return prisma.teacher.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return prisma.teacher.delete({
      where: {
        id,
      },
    });
  }
}