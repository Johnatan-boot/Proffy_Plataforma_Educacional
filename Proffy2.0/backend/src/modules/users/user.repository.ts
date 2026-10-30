import { prisma } from "../../lib/prisma";

export class UserRepository {
  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: "TEACHER" | "STUDENT" | "ADMIN";
    avatar?: string;
    whatsapp?: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      passwordHash?: string;
      role?: "TEACHER" | "STUDENT" | "ADMIN";
      avatar?: string;
      whatsapp?: string;
    },
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
