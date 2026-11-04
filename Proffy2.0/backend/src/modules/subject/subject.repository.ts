import { prisma } from "../../lib/prisma";

export class SubjectRepository {
  async create(data: {
    name: string;
  }) {
    return prisma.subject.create({
      data,
    });
  }

  async findAll() {
    return prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async findById(id: string) {
    return prisma.subject.findUnique({
      where: {
        id,
      },
    });
  }

  async findByName(name: string) {
    return prisma.subject.findUnique({
      where: {
        name,
      },
    });
  }

  async delete(id: string) {
    return prisma.subject.delete({
      where: {
        id,
      },
    });
  }

  async update(id: string, data: { name: string }) {
    return prisma.subject.update({
      where: {
        id,
      },
      data,
    });
  }
}