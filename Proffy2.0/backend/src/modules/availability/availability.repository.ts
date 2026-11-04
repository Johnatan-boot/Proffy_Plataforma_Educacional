import { prisma } from "../../lib/prisma";

export class AvailabilityRepository {
  async create(data: {
    teacherId: string;
    weekDay: number;
    from: string;
    to: string;
  }) {
    return prisma.availability.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.availability.findUnique({
      where: {
        id,
      },
    });
  }

  async findByTeacherId(teacherId: string) {
    return prisma.availability.findMany({
      where: {
        teacherId,
      },
      orderBy: [{ weekDay: "asc" }, { from: "asc" }],
    });
  }

  async delete(id: string) {
    return prisma.availability.delete({
      where: {
        id,
      },
    });
  }
}