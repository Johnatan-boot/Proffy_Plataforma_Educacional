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

  // Exclui o USUÁRIO dono do perfil: o cascade remove o professor e tudo que
  // depende dele (matérias, disponibilidades, aulas). Antes só o perfil era
  // apagado e o usuário ficava órfão (o e-mail continuava "em uso").
  async delete(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!teacher) {
      return null;
    }

    return prisma.user.delete({
      where: { id: teacher.userId },
    });
  }
}