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

  // Mesma lógica do professor: remove o usuário (cascade apaga o perfil).
  async delete(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!student) {
      return null;
    }

    return prisma.user.delete({
      where: { id: student.userId },
    });
  }
}