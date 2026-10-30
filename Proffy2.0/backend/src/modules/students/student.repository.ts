import { prisma } from "../../lib/prisma";

export class StudentRepository {
  async create(data: {
    userId: string;
  }) {
    return prisma.student.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.student.findUnique({
      where: {
        id,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.student.findUnique({
      where: {
        userId,
      },
    });
  }

  async findAllWithDetails() {
    return prisma.student.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByIdWithDetails(id: string) {
    return prisma.student.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.student.delete({
      where: {
        id,
      },
    });
  }
}